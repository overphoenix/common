import { falsely } from "../primitives";
import { isArray, isFunction, isObject, isString } from "../predicates";
import { typeOf } from "../typeof";
import { keys } from "./entries";
import { InvalidArgumentException } from "../error";

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
    throw new InvalidArgumentException(`Unsupported type of 'props': ${typeOf(props)}`);
  }

  const list = keys(obj, {
    enumOnly: false
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
