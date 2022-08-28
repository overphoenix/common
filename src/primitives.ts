import { isArray } from './predicates';

export const EMPTY_BUFFER = Buffer.allocUnsafe(0);

const null_ = Symbol.for('rs:null');
const undefined_ = Symbol.for('rs:undefined');

export { null_ as null, undefined_ as undefined };

export const noop = () => {};

export const identity = (x: any) => x;

export const truly = () => true;

export const falsely = () => false;

export const o = (...props: Array<any>) =>
  props.length > 0 ? Object.assign({}, ...props) : Object.create(null);

export const arrify = (val: any) => {
  return val === void 0 ? [] : !isArray(val) ? [val] : val;
};
