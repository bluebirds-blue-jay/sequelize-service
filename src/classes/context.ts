import * as Lodash from 'lodash';


export class Context<T extends {} = any> {
  private readonly data: Map<keyof T, T[keyof T]>;

  public constructor(data: T = {} as T) {
    this.data = new Map(Lodash.toPairs(data)) as Map<keyof T, T[keyof T]>;
  }

  public as<U extends T>(): Context<U> {
    return this as unknown as Context<U>;
  }

  public get<K extends keyof T>(key: K): T[K] {
    return this.data.get(key) as T[K];
  }

  public set<K extends keyof T>(key: K, value: T[K]): this {
    this.data.set(key, value);
    return this;
  }
}
