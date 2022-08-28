// TODO: tests
export const unique = (array: Array<any>, projection?: (a: any) => void) => {
  const tmp = new Set();
  const result: any[] = [];
  for (let i = 0; i < array.length; ++i) {
    const value = array[i];
    const hash = typeof projection === 'function' ? projection(value) : value;
    if (tmp.has(hash)) {
      continue;
    }
    result.push(value);
    tmp.add(hash);
  }
  return result;
};
