import * as Lodash from 'lodash';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { IUpdateSession } from '../interfaces/update-session';
import { TFilters } from '../types/filters';
import { TUpdateOptions } from '../types/update-options';
import { TValues } from '../types/values';
import { TValuesMap } from '../types/values-map';
import { Session } from './session';

export class UpdateSession<W extends {}, R extends W, C extends {}, O extends {} = {}> extends Session<W, R, C, TUpdateOptions<R> & O> implements IUpdateSession<W, R, C, O> {
  private updateValues: TValuesMap<W>;

  public constructor(filters: TFilters<R>, values: TValues<W>, options: TUpdateOptions<R> & O, service: ISequelizeService<W, R, C>) {
    super([], options, service, filters);
    this.updateValues = <TValuesMap<W>>new Map(Lodash.toPairs(values));
  }

  public getValues() {
    return this.updateValues;
  }

  public getRawValues(): TValues<W> {
    return Lodash.fromPairs(Array.from(this.updateValues.entries())) as any;
  }

  public hasValue(key: keyof W) {
    return this.updateValues.has(key);
  }

  public getValue<K extends keyof W>(key: K): W[K] {
    return <W[K]>this.updateValues.get(key);
  }

  public setValue<K extends keyof W>(key: K, value: W[K]) {
    this.updateValues.set(key, value);
    return this;
  }
}
