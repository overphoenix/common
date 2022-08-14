
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
