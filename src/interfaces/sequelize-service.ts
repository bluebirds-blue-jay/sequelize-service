import { TFilters } from '../types/filters';
import { TFindOptions } from '../types/find-options';
import { Collection } from '@bluejay/collection';
import { TFindOneOptions } from '../types/find-one-options';
import { TFindByPrimaryKeyOptions } from '../types/find-by-primary-key-options';
import { TUpdateOptions } from '../types/update-options';
import { TValues } from '../types/values';
import { TUpdateByPrimaryKeyOptions } from '../types/update-by-primary-key-options';

export interface ISequelizeService<A> {
  getPrimaryKeyField(): keyof A;
  create(object: A): Promise<A>;
  createMany(objects: A[]): Promise<Collection<A>>;
  find(filters: TFilters<A>, options?: TFindOptions<A>): Promise<Collection<A>>;
  warn(condition: boolean, message: string, data?: object): void;
  findOne(filters: TFilters<A>, options?: TFindOneOptions<A>): Promise<A>;
  findByPrimaryKey(pk: string | number, options?: TFindByPrimaryKeyOptions<A>): Promise<A>;
  findByPrimaryKeys(pks: string[] | number[], options?: TFindByPrimaryKeyOptions<A>): Promise<Collection<A>>;
  update(filters: TFilters<A>, values: TValues<A>, options?: TUpdateOptions<A>): Promise<number>;
  updateByPrimaryKey(pk: string | number, values: TValues<A>, options?: TUpdateByPrimaryKeyOptions<A>): Promise<number>;
}