import { RateLimiter } from './rate_limiter.js';
import { isNull, isFunction, isNumber, isPromise } from '../predicates/index.js';
import { LinkedList } from '../linked_list.js';

const DROPPED = Symbol('DROPPED');

class Delayed {
  public cancelled = false;

  constructor(public resolve, public fn, public self, public args) {}

  cancel() {
    this.cancelled = true;
    !isNull(this.resolve) && this.resolve(DROPPED);
  }
}

const throttleNoInterval = (concurrency, drop, dropLast, fn, onDone) => {
  let remaning = concurrency;
  const queue = new LinkedList();
  let release: Function | null = null;

  const run = (fn, self, args) => {
    if (remaning) {
      remaning--;

      let result;

      // TODO: ???
      if (fn.length === 1) {
        // with callback
        result = fn.call(self, release, ...args);
      } else {
        result = fn.apply(self, args);
        if (isPromise(result)) {
          result.then(release, release);
        }
      }

      return Promise.resolve(result);
    }
    if (drop) {
      if (dropLast) {
        return Promise.resolve(DROPPED);
      }
      if (queue.length) {
        // cancel the last delayed call
        queue.shift().cancel();
      }
    }

    if (fn.length === 1) {
      queue.push(new Delayed(null, fn, self, args));
    } else {
      return new Promise((resolve) => {
        queue.push(new Delayed(resolve, fn, self, args));
      });
    }
  };

  release = () => {
    remaning++;

    if (remaning === concurrency) {
      isFunction(onDone) && onDone();
    }
    if (!queue.empty) {
      const next = queue.shift();
      if (isNull(next.resolve)) {
        run(next.fn, next.self, next.args);
      } else {
        next.resolve(run(next.fn, next.self, next.args));
      }
    }
  };

  if (isFunction(fn)) {
    return function (...args) {
      return run(fn, this, args);
    };
  }
  return function (fn, ...args) {
    if (!isFunction(fn)) {
      throw new TypeError('The first argument must be a function');
    }
    return run(fn, this, args);
  };
};

const throttle = function (fn, opts = {}) {
  if (!isFunction(fn)) {
    [fn, opts] = [opts, fn];
  }
  if (isNumber(opts)) {
    opts = { concurrency: opts };
  }
  const {
    concurrency = 1,
    interval = 0,
    ordered = true,
    waitForReturn = true,
    drop = false,
    dropLast = true,
    onDone,
  } = opts;

  // Just for fun
  if (concurrency === Infinity) {
    throw new TypeError('Infinite concurrency is not allowed');
  }

  if (!interval) {
    return throttleNoInterval(concurrency, drop, dropLast, fn, onDone);
  }

  const limiter = new RateLimiter(concurrency, interval);

  let getFn;

  if (isFunction(fn)) {
    getFn = (args) => [fn, args];
  } else {
    getFn = (args) => {
      const fn = args.shift();
      return [fn, args];
    };
  }

  let removeTokens = () => limiter.removeTokens(1);

  if (ordered) {
    removeTokens = throttleNoInterval(1, false, false, removeTokens);
  }

  let removing = false;
  let delayed = null;

  let executor = (self, fn, args) => {
    if (limiter.tryRemoveTokens(1)) {
      return new Promise((resolve) => {
        resolve(fn.apply(self, args));
      });
    }
    if (drop) {
      if (dropLast) {
        return Promise.resolve(DROPPED);
      }
      if (delayed) {
        delayed.cancel();
      }
      if (removing) {
        return new Promise((resolve) => {
          delayed = new Delayed(resolve, fn, self, args);
        });
      }
    }
    removing = true;
    return removeTokens().then(() => {
      removing = false;
      if (delayed) {
        const d = delayed;
        delayed = null;

        d.resolve(d.fn.apply(d.self, d.args));
        return DROPPED;
      }
      return fn.apply(self, args);
    });
  };

  if (waitForReturn) {
    executor = throttleNoInterval(1, drop, dropLast, executor);
  }

  return function throttled(...args) {
    const [fn, _args] = getFn(args);
    return executor(this, fn, _args);
  };
};

export { throttle, RateLimiter, DROPPED };
