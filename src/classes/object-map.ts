export class ObjectMap<T extends {}, K extends keyof T = keyof T> {
  private readonly data: T;
  public constructor(data: T) {
    this.data = Object.freeze({ ...<{}>data } as T);
  }

  public get(key: K): T[K] {
    return this.data[key] as T[K];
  }

  public set<U extends {}>(newData: Partial<T> & U): ObjectMap<T & U> {
    return new ObjectMap<T & U>({ ...<{}>this.data, ...<{}>newData } as (T & U)); // See https://github.com/Microsoft/TypeScript/issues/14409
  }

  public getData() {
    return this.data;
  }
}