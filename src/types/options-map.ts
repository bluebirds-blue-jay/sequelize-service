export type TOptionsMap<T, K extends keyof T = keyof T> = Map<K, T[K]>;
