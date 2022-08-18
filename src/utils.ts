import { isString, isFunction, isObject, isArray, isUndefined } from "./predicates";
import { InvalidArgumentException } from "./error"
import { keys } from "./entries";
import typeOf from "./typeof";

export const EMPTY_BUFFER = Buffer.allocUnsafe(0);

const null_ = Symbol.for("rs:null");
const undefined_ = Symbol.for("rs:undefined");

export {
  null_ as null,
  undefined_ as undefined
};

export const noop = () => { };

export const identity = (x: any) => x;

export const truly = () => true;

export const falsely = () => false;

export const o = (...props: Array<any>) => props.length > 0 ? Object.assign({}, ...props) : Object.create(null);

// TODO: tests
export const unique = (array: Array<any>, projection?: ((a: any) => void)) => {
  const tmp = new Set();
  const result: any[] = [];
  for (let i = 0; i < array.length; ++i) {
    const value = array[i];
    const hash = typeof projection === "function" ? projection(value) : value;
    if (tmp.has(hash)) {
      continue;
    }
    result.push(value);
    tmp.add(hash);
  }
  return result;
};

export const arrify = (val: any) => {
  return val === void 0
    ? []
    : !isArray(val)
      ? [val]
      : val;
};

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
