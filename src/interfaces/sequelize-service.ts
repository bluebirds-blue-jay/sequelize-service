import { TFilters } from '../types/filters';
import { TFindOptions } from '../types/find-options';
import { Collection } from '@bluejay/collection';
import { TFindOneOptions } from '../types/find-one-options';
import { TFindByPrimaryKeyOptions } from '../types/find-by-primary-key-options';
import { TUpdateOptions } from '../types/update-options';
import { TValues } from '../types/values';

export interface ISequelizeService<A, PK extends A[keyof A]> {
  getPrimaryKeyField(): keyof A;
  create(object: A): Promise<A>;
  createMany(objects: A[]): Promise<Collection<A>>;
  find(filters: TFilters<A>, options?: TFindOptions<A>): Promise<Collection<A>>;
  warn(condition: boolean, message: string, data?: object): void;
  findOne(filters: TFilters<A>, options?: TFindOneOptions<A>): Promise<A>;
  findByPrimaryKey(pk: PK, options?: TFindByPrimaryKeyOptions<A>): Promise<A>;
  findByPrimaryKeys(pks: PK[], options?: TFindByPrimaryKeyOptions<A>): Promise<Collection<A>>;
  update(filters: TFilters<A>, values: TValues<A>, options?: TUpdateOptions<A>): Promise<number>;
}