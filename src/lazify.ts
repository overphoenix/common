import { createRequire } from 'node:module';
import { isPlainObject } from './predicates/index.js';
import { asNamespace, PRIVATE_SYMBOL } from './namespace.js';

export const defaultMapper = (mod: any, key: string): any =>
  mod !== null &&
  typeof mod === 'object' &&
  mod.__esModule === true &&
  'default' in mod
    ? mod.default
    : mod;

let lazifyErrorhandler: (a: any) => void = (err: Error) => {
  console.error(err);
  process.exit(1);
};

export const setLazifyErrorHandler = (handler: (a: Error) => void) => {
  lazifyErrorhandler = handler;
};

const require = createRequire(import.meta.url);

const requireSafe = (_require: (f: string) => any, value: string) => {
  try {
    return _require(value);
  } catch (err: any) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err;
    }
    lazifyErrorhandler(err);
  }
};

export const lazify = (
  modules: any,
  _obj: object | null,
  _require = require,
  {
    asNamespace: _asNamespace = false,
    configurable = false,
    enumerable = true,
    writable = true, // allow substitute namespaces by default
    mapper = defaultMapper,
  } = {},
) => {
  const obj = _obj || {};
  Object.keys(modules).forEach((key) => {
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable,
      get() {
        const value = modules[key];

        let modExports;
        const valueType = typeof value;
        if (valueType === 'function') {
          modExports = value(key);
        } else if (valueType === 'string') {
          modExports = requireSafe(_require, value);
        } else if (
          Array.isArray(value) &&
          value.length >= 2 &&
          typeof value[0] === 'string'
        ) {
          modExports = requireSafe(_require, value[0]);

          const keepMapper = value[2] === true;

          if (!keepMapper) {
            const selector = value[1];
            const selectorType = typeof selector;
            if (selectorType !== 'function' && selectorType !== 'string') {
              throw new TypeError(
                `Invalid export selector type: ${selectorType}`,
              );
            }
            const prevMapper = mapper;
            mapper = (mod, key: string) => {
              const mappedExports = prevMapper(mod, key);
              mapper = prevMapper; // restore
              return selectorType === 'function'
                ? selector(mappedExports)
                : mappedExports[selector];
            };
          }
        } else {
          throw new TypeError(`Invalid module type of ${key}`);
        }

        try {
          modExports = mapper(modExports, key);
        } catch (err) {
          lazifyErrorhandler(err);
        }

        Object.defineProperty(obj, key, {
          configurable,
          enumerable,
          writable,
          value: modExports,
        });

        try {
          return _asNamespace ? asNamespace(modExports) : modExports;
        } catch (err) {
          return modExports;
        }
      },
    });
  });

  return obj;
};
lazify.mapper = defaultMapper;

export const lazifyp = (
  modules: Array<any>,
  obj: any,
  _require = require,
  options: any,
) => {
  if (isPlainObject(obj[PRIVATE_SYMBOL])) {
    return lazify(modules, obj[PRIVATE_SYMBOL], _require, options);
  }

  obj[PRIVATE_SYMBOL] = lazify(modules, null, _require, options);
  return obj[PRIVATE_SYMBOL];
};
lazifyp.SYMBOL = PRIVATE_SYMBOL;

export const definep = (modules: Array<any>, obj: any) => {
  if (isPlainObject(obj[PRIVATE_SYMBOL])) {
    Object.assign(obj[PRIVATE_SYMBOL], modules);
  } else {
    obj[PRIVATE_SYMBOL] = modules;
  }

  return obj;
};

export const getPrivate = (obj: any) => obj[PRIVATE_SYMBOL];
