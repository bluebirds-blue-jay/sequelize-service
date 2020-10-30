export type TOptions<T> = { [key in keyof T]: T[keyof T] };
