import { isArray } from "../predicates";
import * as EventEmitter from "eventemitter3";
import { throttle } from "../throttle";

export default class AsyncEventEmitter extends EventEmitter {
  private onceMap = new Map();
  private throttler?: any = null;

  constructor(concurrency?: number) {
    super();
    if (typeof concurrency === "number" && concurrency >= 1) {
      this.setConcurrency(concurrency);
    }
  }

  setConcurrency(concurrency?: number) {
    if (typeof concurrency === "number" && concurrency >= 1) {
      this.throttler = throttle({ concurrency });
    } else {
      this.throttler = null;
    }
    return this;
  }

  emitParallel(event, ...args) {
    const promises: Promise<any>[] = [];

    this.listeners(event).forEach((listener) => {
      promises.push(this._executeListener(listener, args));
    });

    return Promise.all(promises);
  }

  emitSerial(event, ...args) {
    return this.listeners(event).reduce((promise, listener) => promise.then((values) =>
      this._executeListener(listener, args).then((value) => {
        values.push(value);
        return values;
      })
    ), Promise.resolve([]));
  }

  emitReduce(event, ...args) {
    return this._emitReduceRun(event, args);
  }

  emitReduceRight(event, ...args) {
    return this._emitReduceRun(event, args, true);
  }

  once(event, listener?) {
    if (typeof listener !== "function") {
      throw new TypeError("listener must be a function");
    }
    let fired = false;
    const self = this;
    const onceListener = function (...args) {
      self.removeListener(event, onceListener);
      if (fired === false) {
        fired = true;
        return listener.apply(this, args);
      }
      return undefined;
    };
    this.on(event, onceListener);
    this.onceMap.set(listener, onceListener);
    return this;
  }

  removeListener(event, listener) {
    if (this.onceMap.has(listener)) {
      const t = this.onceMap.get(listener);
      this.onceMap.delete(listener);
      listener = t;
    }
    return super.removeListener(event, listener);
  }

  subscribe(event, listener, once = false) {
    const unsubscribe = () => {
      this.removeListener(event, listener);
    };

    if (once) {
      this.once(event, listener);
    } else {
      this.on(event, listener);
    }

    return unsubscribe;
  }

  private _emitReduceRun(event, args, inverse = false) {
    const listeners = inverse ? this.listeners(event).reverse() : this.listeners(event);
    return listeners.reduce((promise, listener) => promise.then((prevArgs) => {
      const currentArgs = isArray(prevArgs) ? prevArgs : [prevArgs];
      return this._executeListener(listener, currentArgs);
    }), Promise.resolve(args));
  }

  private _executeListener(listener, args): Promise<any> {
    try {
      if (this.throttler) {
        return this.throttler(() => listener(...args));
      }
      return Promise.resolve(listener(...args));
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
