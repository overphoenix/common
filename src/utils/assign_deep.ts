import { isPlainObject } from '../predicates/index.js';
import { clone } from './clone.js';
import { entries } from './entries.js';

export const assignDeep = (target: any, ...sources: any[]) => {
  const result = target || {};
  for (const src of sources) {
    if (!isPlainObject(src)) {
      continue;
    }
    for (const [key, value] of entries(src)) {
      if (isPlainObject(value) && isPlainObject(result[key])) {
        assignDeep(result[key], value);
      } else {
        result[key] = clone(value);
      }
    }
  }
  return result;
};
