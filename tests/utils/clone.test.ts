import { clone } from "../../lib";

describe("clone", () => {
  
  describe("objects", () => {
    it("not deep", () => {
      const s = { a: 1, b: { a: 1 } };
      const t = clone(s, { deep: false });
      expect(t).toEqual(s);
      expect(t).not.toBe(s);
      t.b.b = 2;
      expect(t.b).toEqual(s.b);
    });

    it("deep", () => {
      const s = { a: 1, b: { a: 1 } };
      const t = clone(s, { deep: true });
      expect(t).toEqual(s);
      expect(t).not.toBe(s);
      t.b.b = 2;
      expect(t.b).not.toEqual(s.b);
    });
  });

  describe("arrays", () => {
    describe("inside objects", () => {
      it("not deep", () => {
        const s = { a: [1, 2, 3] };
        const t = clone(s, { deep: false });
        expect(t).toEqual(s);
        expect(t).not.toBe(s);
        expect(t.a).toEqual(s.a);
      });

      it("deep", () => {
        const s = { a: [1, 2, 3] };
        const t = clone(s, { deep: true });
        expect(t).toEqual(s);
        expect(t).not.toBe(s);
        expect(t.a).not.toBe(s.a);
        expect(t.a).toEqual(s.a);
      });
    });

    it("not deep", () => {
      const s = [1, 2, [1, 2, 3]];
      const t = clone(s, { deep: false });
      expect(t).not.toBe(s);
      expect(t).toEqual(s);
      s[2].push(3);
      expect(t).toEqual(s);
    });

    it("deep", () => {
      const s: any[] = [1, 2, [1, 2, 3]];
      const t = clone(s, { deep: true });
      expect(t).not.toBe(s);
      expect(t).toEqual(s);
      s[2].push(3);
      expect(t).not.toEqual(s);
    });
  });

  it("should set deep = true by default", () => {
    const s = { a: { b: { c: 1 } } };
    const t = clone(s);
    expect(t).toEqual(s);
    t.a.b.d = 2;
    expect(s.a.b).not.toHaveProperty("d");
  });

  it("should clone a date object", () => {
    const d = new Date(123123);
    const s = { a: d };
    const t = clone(s);
    expect(t.a).toBeInstanceOf(Date);
    expect(t.a.getTime()).toEqual(d.getTime());
    d.setHours(22);
    expect(t.a.getTime()).not.toEqual(d.getTime());
  });

  it("should clone a buffer object", () => {
    const b = Buffer.from("hello");
    const s = { a: b };
    const t = clone(s);
    expect(t.a).toEqual(b);
    b.writeInt32LE(100500, 0);
    expect(t.a).not.toEqual(b);
  });

  it("should not clone non-enumerable properies when enumOnly = false", () => {
    const s = {};
    Object.defineProperty(s, "a", {
      enumerable: false,
      value: 42
    });
    const t = clone(s);
    expect(t).toEqual(s);
  });

  it("should clone non-enumerable properies when enumOnly = true", () => {
    const s = {};
    Object.defineProperty(s, "a", {
      enumerable: false,
      value: 42
    });
    const t = clone(s, { enumOnly: false });
    expect(t).toEqual({ a: 42 });
  });

  it("should not touch non-plain objects", () => {
    class Thing {
      say() {
        console.log("hello");
      }
    }
    const thing = new Thing();
    const s = { a: { b: [thing] } };
    const t = clone(s);
    expect(t.a.b[0]).toEqual(thing);
  });

  it("should try to clone non-plain objects when nonPlainObject = true", () => {
    class Thing {
      property = 42;
    }
    const thing = new Thing();
    const s = { a: { b: [thing] } };
    const t = clone(s, { enumOnly: false, nonPlainObjects: true });
    expect(t.a.b[0]).not.toBeUndefined();
    expect(t.a.b[0]).not.toBe(thing);
    expect(t.a.b[0]).toEqual({ property: 42 });
  });
});
