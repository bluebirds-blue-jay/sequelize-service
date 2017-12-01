import { TUpdateOptions } from '../types/update-options';
import { Session } from './session';
import { TFilters } from '../types/filters';
import { TValues } from '../types/values';
import { ISequelizeService } from '../interfaces/sequelize-service';
import * as Lodash from 'lodash';
import { TValuesMap } from '../types/values-map';
import { IUpdateSession } from '../interfaces/update-session';

export class UpdateSession<W extends {}, R extends W, C extends {}> extends Session<W, R, C, TUpdateOptions<R>> implements IUpdateSession<W, R, C> {
  private values: TValuesMap<W>;

  public constructor(filters: TFilters<R>, values: TValues<W>, options: TUpdateOptions<R>, service: ISequelizeService<W, R, C>) {
    super([], options, service, filters);
    this.values = <TValuesMap<W>>new Map(Lodash.toPairs(values));
  }

  public getValues() {
    return this.values;
  }

  public getRawValues(): TValues<W> {
    return Lodash.fromPairs(Array.from(this.values.entries())) as any;
  }

  public hasValue(key: keyof W) {
    return this.values.has(key);
  }

  public getValue<T extends Partial<W>[keyof W]>(key: keyof W): T {
    return <T>this.values.get(key);
  }

  public setValue<K extends keyof W>(key: K, value: W[K]) {
    this.values.set(key, value);
    return this;
  }
}