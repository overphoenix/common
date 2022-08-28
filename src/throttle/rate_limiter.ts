import { isString } from '../predicates/index.js';
import { delay } from '../promise.js';

const getMilliseconds = function () {
  const hrtime = process.hrtime();
  const seconds = hrtime[0];
  const nanoseconds = hrtime[1];

  return seconds * 1e3 + Math.floor(nanoseconds / 1e6);
};

class TokenBucket {
  private _interval: number;

  public content: number = 0;

  private lastDrip = Number(new Date());

  constructor(
    public bucketSize = 1,
    public tokensPerInterval = 1,
    interval: number | string = 1000,
    public parentBucket?: TokenBucket,
  ) {
    if (isString(interval)) {
      switch (interval) {
        case 'sec':
        case 'second': {
          this._interval = 1000;
          break;
        }
        case 'min':
        case 'minute': {
          this._interval = 1000 * 60;
          break;
        }
        case 'hr':
        case 'hour': {
          this._interval = 1000 * 60 * 60;
          break;
        }
        case 'day': {
          this._interval = 1000 * 60 * 60 * 24;
          break;
        }
        default:
          throw new Error(`Invaid interval ${interval}`);
      }
    } else {
      this._interval = typeof interval === 'number' ? interval : 1000;
    }
  }

  get interval() {
    return this._interval;
  }

  private _waitInterval(count) {
    return Math.ceil(
      (count - this.content) * (this._interval / this.tokensPerInterval),
    );
  }

  async removeTokens(count: number) {
    // Is this an infinite size bucket?
    if (!this.bucketSize) {
      return count;
    }

    // Make sure the bucket can hold the requested number of tokens
    if (count > this.bucketSize) {
      throw new RangeError(
        `Requested tokens ${count} exceeds bucket size ${this.bucketSize}`,
      );
    }

    // Drip new tokens into this bucket
    this.drip();

    // If we don't have enough tokens in this bucket, come back later
    if (count > this.content) {
      await delay(this._waitInterval(count));
      return this.removeTokens(count);
    }

    if (this.parentBucket instanceof TokenBucket) {
      // Remove the requested from the parent bucket first
      const remainingTokens = await this.parentBucket.removeTokens(count);

      // Check that we still have enough tokens in this bucket
      if (count > this.content) {
        await delay(this._waitInterval(count));
        return this.removeTokens(count);
      }

      // Tokens were removed from the parent bucket, now remove them from
      // this bucket and fire the callback. Note that we look at the current
      // bucket and parent bucket's remaining tokens and return the smaller
      // of the two values
      this.content -= count;
      return Math.min(remainingTokens, this.content);
    }

    // Remove the requested tokens from this bucket and fire the callback
    this.content -= count;

    return this.content;
  }

  tryRemoveTokens(count) {
    // Is this an infinite size bucket?
    if (!this.bucketSize) {
      return true;
    }

    // Make sure the bucket can hold the requested number of tokens
    if (count > this.bucketSize) {
      return false;
    }

    // Drip new tokens into this bucket
    this.drip();

    // If we don't have enough tokens in this bucket, return false
    if (count > this.content) {
      return false;
    }

    // Try to remove the requested tokens from the parent bucket
    if (this.parentBucket && !this.parentBucket.tryRemoveTokens(count)) {
      return false;
    }

    // Remove the requested tokens from this bucket and return
    this.content -= count;
    return true;
  }

  drip() {
    if (!this.tokensPerInterval) {
      this.content = this.bucketSize;
      return;
    }

    const now = Number(new Date());
    const deltaMS = Math.max(now - this.lastDrip, 0);
    this.lastDrip = now;

    const dripAmount = deltaMS * (this.tokensPerInterval / this._interval);
    this.content = Math.min(this.content + dripAmount, this.bucketSize);
  }
}

export class RateLimiter {
  static TokenBucket = TokenBucket;

  private tokensThisInterval = 0;

  private tokenBucket: TokenBucket;

  private curIntervalStart = getMilliseconds();

  constructor(
    tokensPerInterval = 1,
    interval = 1000,
    private fireImmediately = false,
  ) {
    this.tokenBucket = new TokenBucket(
      tokensPerInterval,
      tokensPerInterval,
      interval,
    );

    // Fill the token bucket to start
    this.tokenBucket.content = tokensPerInterval;
  }

  async removeTokens(count) {
    // Make sure the request isn't for more than we can handle
    if (count > this.tokenBucket.bucketSize) {
      throw new RangeError(
        `Requested tokens ${count} exceeds maximum tokens per interval ${this.tokenBucket.bucketSize}`,
      );
    }

    const now = getMilliseconds();

    // Advance the current interval and reset the current interval token count if needed
    if (now - this.curIntervalStart >= this.tokenBucket.interval) {
      this.curIntervalStart = now;
      this.tokensThisInterval = 0;
    }

    // If we don't have enough tokens left in this interval, wait until the next interval
    if (count > this.tokenBucket.tokensPerInterval - this.tokensThisInterval) {
      if (this.fireImmediately) {
        return -1;
      }
      const waitInterval = Math.ceil(
        this.curIntervalStart + this.tokenBucket.interval - now,
      );
      await delay(waitInterval);
    }

    const tokensRemaining = await this.tokenBucket.removeTokens(count);

    this.tokensThisInterval += count;

    return tokensRemaining;
  }

  tryRemoveTokens(count) {
    // Make sure the request isn't for more than we can handle
    if (count > this.tokenBucket.bucketSize) {
      return false;
    }

    const now = getMilliseconds();

    // Advance the current interval and reset the current interval token count
    // if needed
    if (now - this.curIntervalStart >= this.tokenBucket.interval) {
      this.curIntervalStart = now;
      this.tokensThisInterval = 0;
    }

    // If we don't have enough tokens left in this interval, return false
    if (count > this.tokenBucket.tokensPerInterval - this.tokensThisInterval) {
      return false;
    }

    // Try to remove the requested number of tokens from the token bucket
    const removed = this.tokenBucket.tryRemoveTokens(count);
    if (removed) {
      this.tokensThisInterval += count;
    }
    return removed;
  }

  getTokensRemaining() {
    this.tokenBucket.drip();
    return this.tokenBucket.content;
  }
}
