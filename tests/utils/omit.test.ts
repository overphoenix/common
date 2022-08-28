import { keys, isFunction, omit } from '../../lib';

describe('omit', () => {
  it('should omit a key from the object', () => {
    expect(omit({ a: 'a', b: 'b', c: 'c' }, 'a')).toEqual({ b: 'b', c: 'c' });
    expect(omit({ aaa: 'a', bbb: 'b', ccc: 'c' }, 'aaa')).toEqual({
      bbb: 'b',
      ccc: 'c',
    });
  });

  it('should omit an array of keys from the object', () => {
    expect(omit({ a: 'a', b: 'b', c: 'c' }, ['a', 'c'])).toEqual({ b: 'b' });
  });

  it('should return the object if no keys are given', () => {
    expect(omit({ a: 'a', b: 'b', c: 'c' })).toEqual({
      a: 'a',
      b: 'b',
      c: 'c',
    });
  });

  it('should return a new object when no keys are given', () => {
    const obj = { a: 'a', b: 'b', c: 'c' };
    expect(omit(obj) !== obj).toBeTruthy();
  });

  it('should omit using a filter function', () => {
    const foo = omit({ a: 'a', b: 'b', c: 'c' }, (key) => key === 'a');
    const bar = omit({ a: 'a', b: 'b', c() {} }, (key, val) => isFunction(val));
    expect(bar).toEqual({ a: 'a', b: 'b' });
    expect(foo).toEqual({ b: 'b', c: 'c' });
  });

  it('should return an empty object if the first arg is not an object', () => {
    expect(omit(null, { a: 'a', b: 'b', c: 'c' })).toEqual({});
  });

  it('should return an empty object if no object is specified', () => {
    expect(omit()).toEqual({});
  });

  it('should omit all items', () => {
    expect(
      omit(
        {
          __dirname: false,
          __filename: false,
          Buffer: false,
          clearImmediate: false,
          clearInterval: false,
          clearTimeout: false,
          console: false,
          exports: true,
          global: false,
          Intl: false,
          module: false,
          process: false,
          require: false,
          setImmediate: false,
          setInterval: false,
          setTimeout: false,
        },
        ['exports', '__dirname', '__filename', 'module', 'require'],
      ),
    ).toEqual({
      Buffer: false,
      clearImmediate: false,
      clearInterval: false,
      clearTimeout: false,
      console: false,
      global: false,
      Intl: false,
      process: false,
      setImmediate: false,
      setInterval: false,
      setTimeout: false,
    });
  });

  it('should return really empty object for props=true', () => {
    class A {
      constructor(public sec) {}
    }

    expect(omit(A, true)).toEqual({});
  });

  it('should not omit non-enumerable properties', () => {
    class A {
      constructor(public sec) {}
    }

    const result = keys(omit(A, ['a']), {
      enumOnly: false,
    });

    expect(result.sort()).toEqual(
      keys(A, {
        enumOnly: false,
      }).sort(),
    );
  });

  it('not omitted properties should have same descriptors', () => {
    class A {
      static prop1 = 12;

      constructor(public sec) {}
    }

    const originalDescrs: any[] = [];
    const resultDescrs: any[] = [];

    const keys_ = keys(omit(A, ['a']), {
      enumOnly: false,
    });

    for (const key of keys_) {
      if (key === 'name') {
        continue;
      }
      originalDescrs.push(Object.getOwnPropertyDescriptor(A, key));
    }

    const result = omit(A, ['name']);
    for (const key of keys(result, { enumOnly: false })) {
      resultDescrs.push(Object.getOwnPropertyDescriptor(result, key));
    }

    expect(resultDescrs).toEqual(originalDescrs);
  });
});
