export const PRIVATE_SYMBOL = Symbol();
export const NAMESPACE_SYMBOL = Symbol();

export const asNamespace = (obj: any) => {
  obj[NAMESPACE_SYMBOL] = true;
  return obj;
};
asNamespace.SYMBOL = NAMESPACE_SYMBOL;