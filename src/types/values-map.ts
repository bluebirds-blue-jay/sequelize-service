export type TValuesMap<T> = Map<keyof Partial<T>, Partial<T>[keyof T]>;
