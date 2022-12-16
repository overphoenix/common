import os from 'node:os';
import { isString } from '../predicates/index.js';
import indent from 'indent-string';

export const exceptionIdMap: Record<any, number> = {};
export const stdIdMap: Record<string, number> = {};
export const stdExceptions: any[] = [];
export const ateosExceptions: any[] = [];

export class Exception extends Error {
  public id: number = 0;

  constructor(message: any, captureStackTrace = true) {
    super(message instanceof Error ? message.message : message);

    if (message instanceof Error) {
      this.stack = message.stack;
    } else {
      // special case for mpak-serializer
      if (message === null) {
        return;
      }

      this.message = message;

      if (captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
    // @ts-ignore
    this.id = exceptionIdMap[this.constructor];
    Object.defineProperty(this, 'name', {
      enumerable: true,
      value: this.constructor.name,
      writable: true,
    });
    // void this.stack;
  }
}

export class RuntimeException extends Exception {}
export class IncompleteBufferException extends Exception {}
export class NotImplementedException extends Exception {}
export class IllegalStateException extends Exception {}
export class NotValidException extends Exception {}
export class UnknownException extends Exception {}
export class NotExistsException extends Exception {}
export class ExistsException extends Exception {}
export class EmptyException extends Exception {}
export class InvalidAccessException extends Exception {}
export class NotSupportedException extends Exception {}
export class InvalidArgumentException extends Exception {}
export class InvalidNumberOfArgumentsException extends Exception {}
export class NotFoundException extends Exception {}
export class TimeoutException extends Exception {}
export class IncorrectException extends Exception {}
export class NotAllowedException extends Exception {}
export class LimitExceededException extends Exception {}
export class EncodingException extends Exception {}
export class ImmutableException extends Exception {}
export class OutOfRangeException extends Exception {}
export class CopyException extends Exception {}

export class NetworkException extends Exception {}
export class BindException extends NetworkException {}
export class ConnectException extends NetworkException {}

export class DatabaseException extends Exception {}
export class DatabaseInitializationException extends DatabaseException {}
export class DatabaseOpenException extends DatabaseException {}
export class DatabaseReadException extends DatabaseException {}
export class DatabaseWriteException extends DatabaseException {}

export class NetronIllegalStateException extends Exception {}
export class NetronPeerDisconnectedException extends Exception {}
export class NetronTimeoutException extends Exception {}

const extractPathRegex = /\s+at.*(?:\(|\s)(.*)\)?/;
const pathRegex =
  /^(?:(?:(?:node|(?:internal\/[\w/]*|.*node_modules\/babel-polyfill\/.*)?\w+)\.js:\d+:\d+)|native)/;
const homeDir = os.homedir();

export const cleanStack = (stack: string, { pretty = false } = {}) => {
  return stack
    .replace(/\\/g, '/')
    .split('\n')
    .filter((x) => {
      const pathMatches = x.match(extractPathRegex);
      if (pathMatches === null || !pathMatches[1]) {
        return true;
      }

      const match = pathMatches[1];

      // Electron
      if (
        match.includes('.app/Contents/Resources/electron.asar') ||
        match.includes('.app/Contents/Resources/default_app.asar')
      ) {
        return false;
      }

      return !pathRegex.test(match);
    })
    .filter((x) => x.trim() !== '')
    .map((x) => {
      if (pretty) {
        return x.replace(extractPathRegex, (m, p1) =>
          m.replace(p1, p1.replace(homeDir, '~')),
        );
      }

      return x;
    })
    .join('\n');
};

const cleanInternalStack = (stack: string) =>
  stack.replace(/\s+at .*aggregate-error\/index.js:\d+:\d+\)?/g, '');

export class AggregateException extends Exception {
  constructor(private errors: any[]) {
    // Even though strings are iterable, we don't allow them to prevent subtle user mistakes
    if (!errors[Symbol.iterator] || isString(errors)) {
      throw new TypeError(
        `Expected input to be iterable, got ${typeof errors}`,
      );
    }

    errors = Array.from(errors).map((err) =>
      err instanceof Error ? err : new Error(err),
    );

    let message = errors
      .map((err) => cleanInternalStack(cleanStack(err.stack)))
      .join('\n');
    message = `\n${indent(message, 4)}`;

    super(message);
    Object.defineProperty(this, '_errors', { value: errors });
  }

  *[Symbol.iterator]() {
    for (const error of this.errors) {
      yield error;
    }
  }
}

export const idExceptionMap: Record<number, any> = {
  1: Error,
  2: SyntaxError,
  3: TypeError,
  4: ReferenceError,
  5: RangeError,
  6: EvalError,
  7: URIError,

  10: Exception,
  11: RuntimeException,
  12: IncompleteBufferException,
  13: NotImplementedException,
  14: IllegalStateException,
  15: NotValidException,
  16: UnknownException,
  17: NotExistsException,
  18: ExistsException,
  19: EmptyException,
  20: InvalidAccessException,
  21: NotSupportedException,
  22: InvalidArgumentException,
  23: InvalidNumberOfArgumentsException,
  24: NotFoundException,
  25: TimeoutException,
  26: IncorrectException,
  27: NotAllowedException,
  28: LimitExceededException,
  29: EncodingException,
  30: ImmutableException,
  31: OutOfRangeException,
  32: CopyException,

  99: AggregateException,

  100: NetworkException,
  101: BindException,
  102: ConnectException,

  110: DatabaseException,
  111: DatabaseInitializationException,
  112: DatabaseOpenException,
  113: DatabaseReadException,
  114: DatabaseWriteException,

  1000: NetronIllegalStateException,
  1001: NetronPeerDisconnectedException,
  1002: NetronTimeoutException,
};

const keys: number[] = Object.keys(idExceptionMap).map((v) => +v);
for (let i = 0; i < keys.length; i++) {
  const errCode = keys[i];

  const ExceptionClass = idExceptionMap[errCode];
  exceptionIdMap[ExceptionClass] = errCode;

  if (errCode < 10) {
    stdExceptions.push(ExceptionClass);
    stdIdMap[ExceptionClass.name] = errCode;
  } else if (errCode < 1000) {
    ateosExceptions.push(ExceptionClass);
  }
}

export const createError = (id: number, message: string, stack?: string) => {
  const err = new idExceptionMap[id](message);
  err.stack = stack;
  return err;
};

export const getStdErrorId = (err: any) => stdIdMap[err.constructor.name];

export * as errno from 'errno';
export * as stack from './stack.js';
