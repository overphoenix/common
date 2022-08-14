import { isNil } from "./predicates";

const objectOwnProps = Object.getOwnPropertyNames({}.__proto__);

const _keys = (obj, enumOnly, followProto): string[] => {
  if (!followProto) {
    if (enumOnly) {
      return Object.keys(obj);
    }
    return Object.getOwnPropertyNames(obj);
  }

  const props = new Set<any>();

  if (enumOnly) {
    for (const prop in obj) {
      props.add(prop);
    }
  } else {
    const { getOwnPropertyNames: fetchKeys } = Object;
    do {
      const ownKeys = fetchKeys(obj);
      for (let i = 0; i < ownKeys.length; ++i) {
        props.add(ownKeys[i]);
      }
      const prototype = Object.getPrototypeOf(obj);
      if (prototype) {
        const prototypeKeys = fetchKeys(prototype);
        for (let i = 0; i < prototypeKeys.length; ++i) {
          props.add(prototypeKeys[i]);
        }
      }
      obj = obj.__proto__;
    } while (obj);

    for (let i = 0; i < objectOwnProps.length; ++i) {
      props.delete(objectOwnProps[i]); // what if the props are modified?
    }
  }

  return [...props];
};

export const keys = (obj: any, { enumOnly = true, followProto = false, all = false } = {}) => {
  if (isNil(obj)) {
    return [];
  }

  if (all) {
    [enumOnly, followProto] = [false, true];
  }

  return _keys(obj, enumOnly, followProto);
};

// TODO: tests
export const values = (obj: any, { enumOnly = true, followProto = false, all = false } = {}) => {
  if (isNil(obj)) {
    return [];
  }

  if (all) {
    [enumOnly, followProto] = [false, true];
  }

  if (!followProto && enumOnly) {
    return Object.values(obj);
  }

  const k = _keys(obj, enumOnly, followProto);
  for (let i = 0; i < k.length; ++i) {
    k[i] = obj[k[i] as string];
  }
  return k;
};

// TODO: tests
export const entries = (obj: any, { enumOnly = true, followProto = false, all = false } = {}) => {
  if (isNil(obj)) {
    return [];
  }

  if (all) {
    [enumOnly, followProto] = [false, true];
  }

  if (!followProto && enumOnly) {
    return Object.entries(obj);
  }

  const k = _keys(obj, enumOnly, followProto);
  const result = new Array(k.length);
  for (let i = 0; i < k.length; ++i) {
    const key = k[i];
    result[i] = [key, obj[key as string]];
  }
  return result;
};