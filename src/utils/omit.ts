import { falsely } from '../primitives.js';
import { isArray, isFunction, isObject, isString } from '../predicates/index.js';
import { typeOf } from '../typeof.js';
import { keys } from './entries.js';
import { InvalidArgumentException } from '../error/index.js';

export const omit = (obj?: any, props?: any) => {
  if (!isObject(obj)) {
    return {};
  }

  let isShouldOmit;
  if (isFunction(props)) {
    isShouldOmit = props;
  } else if (isArray(props)) {
    isShouldOmit = (name: string) => props.includes(name);
  } else if (isString(props)) {
    isShouldOmit = (val: string) => val === props;
  } else if (props === true) {
    return {};
  } else if (!props) {
    isShouldOmit = falsely;
  } else {
    throw new InvalidArgumentException(
      `Unsupported type of 'props': ${typeOf(props)}`,
    );
  }

  const list = keys(obj, {
    enumOnly: false,
  });

  const result = {};

  for (let i = 0; i < list.length; i++) {
    const key = list[i];
    const val = obj[key];

    if (!isShouldOmit(key, val, obj)) {
      const descr = Object.getOwnPropertyDescriptor(obj, key);
      if (descr !== void 0) {
        Object.defineProperty(result, key, descr);
      }
    }
  }
  return result;
};
