import { arrify } from "../../lib";

describe("arrify", () => {
  it("no args", () => {
    expect(arrify()).toHaveLength(0);
  });

  it.skip("'undefined' as argument", () => {
    expect(arrify(undefined)).toEqual([undefined]);
  });

  it("'null' as argument", () => {
    expect(arrify(null)).toEqual([null]);
  });

  it("array as argument", () => {
    expect(arrify([1, 2, 3])).toEqual([1, 2, 3]);
  });
});