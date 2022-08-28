import {
  isArray,
  isBuffer,
  isDate,
  isFunction,
  isObject,
  isPlainObject,
  isRegexp,
} from '../predicates';
import { keys } from './entries';

export class Cloner {
  clone(
    obj: any,
    { deep = true, nonPlainObjects = false, enumOnly = true } = {},
  ) {
    if (!isObject(obj)) {
      return obj;
    }
    if (isArray(obj)) {
      if (deep) {
        return obj.map((x): any =>
          this.clone(x, { deep, nonPlainObjects, enumOnly }),
        );
      }
      return obj.slice(0);
    }
    if (isFunction(obj)) {
      return obj;
    }
    if (isRegexp(obj)) {
      return new RegExp(obj.source, obj.flags);
    }
    if (isBuffer(obj)) {
      return Buffer.from(obj);
    }
    if (isDate(obj)) {
      return new Date(obj.getTime());
    }
    if (!nonPlainObjects && !isPlainObject(obj)) {
      return obj;
    }
    const res: any = {};
    for (const key of keys(obj, { enumOnly })) {
      res[key] = deep
        ? this.clone(obj[key], { deep, nonPlainObjects, enumOnly })
        : obj[key];
    }
    return res;
  }

  binding() {
    return this.clone.bind(this);
  }
}

export const clone = new Cloner().binding();
