import { keys } from "../lib/entries";
import { inherits } from "util";
const noop = () => { };

test("should be empty array for an empty object", () => {
  const props = keys({});
  expect(props).toEqual([]);
});

test("should return all the properies of an object", () => {
  const props = keys({ a: 1, b: 2, c: 3, d: () => 4, e: { f: 5 } });
  expect(props).toEqual(["a", "b", "c", "d", "e"]);
});

test("should work with classic classes", () => {
  function Test() {
    this.a = 2;
  }
  Test.prototype.b = noop;
  const t = new Test();
  const props = keys(t, { followProto: true });
  expect(props).toEqual(["a", "b"]);
});

test("should work with classic class inheritance", () => {
  function A() {
    this.aProp = 1;
  }
  A.prototype.aMethod = noop;

  function B() {
    A.call(this);
    this.bProp = 2;
  }
  inherits(B, A);
  B.prototype.bMethod = noop;
  const t = new B();
  const props = keys(t, { followProto: true }).sort();
  expect(props).toStrictEqual(["aMethod", "aProp", "bMethod", "bProp"]);
});

test("should work with classes", () => {
  class Test {
    public a = 2;

    b() {
      return 3;
    }
  }
  const t = new Test();
  const props = keys(t, { all: true });
  expect(props).toEqual(["a", "b"]);
});

test("should work with class inheritance", () => {
  class A {
    public aProp = 1;

    aMethod() {

    }
  }

  class B extends A {
    public bProp = 2;

    bMethod() {

    }
  }

  const t = new B();
  const props = keys(t, { all: true }).sort();
  expect(props).toStrictEqual(["aMethod", "aProp", "bMethod", "bProp"]);
});
