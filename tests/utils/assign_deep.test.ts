import { assignDeep} from "../../lib";

describe("assignDeep", () => {
  it("should assign deeply", () => {
    const document = {
      style: {
        align: "left",
        font: {
          size: 14
        }
      },
      body: {
        lines: 100,
        rows: 1000,
        custom: {
          words: 10,
          chars: 28
        }
      }
    };
    assignDeep(document, {
      style: {
        font: {
          value: "Roboto"
        }
      },
      body: {
        pages: 2,
        rows: 1010,
        custom: {
          magic: true,
          chars: 22
        }
      }
    });
    expect(document).toEqual({
      style: {
        align: "left",
        font: {
          size: 14,
          value: "Roboto"
        }
      },
      body: {
        pages: 2,
        lines: 100,
        rows: 1010,
        custom: {
          words: 10,
          chars: 22,
          magic: true
        }
      }
    });
  });

  it("should return the target", () => {
    const target = { a: 1 };
    const ret = assignDeep(target, { b: 2 });
    expect(ret).toBe(target);
    expect(ret).toEqual({ a: 1, b: 2 });
  });

  it("should set the target to empty object if it is falsy", () => {
    expect(assignDeep(null, { a: 2 })).toEqual({ a: 2 });
  });

  it("should support multiple sources", () => {
    expect(assignDeep(
      { a: 1 },
      { b: 2, c: { d: 3 } },
      { c: { e: 5 } },
      { d: { f: 7, g: 1 } },
      { d: { f: 4, y: 2 }, c: { w: 2 } }
    )).toEqual({
      a: 1,
      b: 2,
      c: {
        d: 3,
        e: 5,
        w: 2
      },
      d: {
        f: 4,
        g: 1,
        y: 2
      }
    });
  });

  it("should copy values", () => {
    const a = { a: 1 };
    const b = { b: { c: 10 } };
    assignDeep(a, b);
    b.b.c = 42;
    expect(a).toEqual({ a: 1, b: { c: 10 } });
  });

  it("should not touch not plain objects", () => {
    const f = () => { };
    const a = { a: { b: 10 } };
    const b = { a: f, b: f };
    assignDeep(a, b);
    expect(a).toEqual({ a: f, b: f });
  });
});