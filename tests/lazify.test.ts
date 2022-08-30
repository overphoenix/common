import { lazify } from "../lib";
import fs from "node:fs";
import path from "node:path";
import upath from 'upath';

describe('lazify', () => {
  it('lazify empty object', () => {
    const obj = {};
    lazify({
      fs: 'node:fs'
    }, obj, require);
    expect(obj).toHaveProperty('fs');
    expect(obj.fs).toEqual(fs);
  })

  it('lazify already lazified prop', () => {
    const obj = {};
    lazify({
      path: 'node:path'
    }, obj, require);
    expect(obj).toHaveProperty('path');
    expect(obj.path).toEqual(path);
    expect (() => {
      lazify({
        path: 'upath'
      }, obj, require);
    }).not.toThrow();
    expect(obj.path).toEqual(path);
  })
});
