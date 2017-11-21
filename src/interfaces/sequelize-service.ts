import { Collection } from '@bluejay/collection';
import { TFilters } from '../types/filters';
import { TValues } from '../types/values';
import { TCreateOptions } from '../types/create-options';
import { TFindOptions } from '../types/find-options';
import { TFindOneOptions } from '../types/find-one-options';
import { TFindByPrimaryKeyOptions } from '../types/find-by-primary-key-options';
import { TUpdateOptions } from '../types/update-options';
import { TUpdateByPrimaryKeyOptions } from '../types/update-by-primary-key-options';
import { TDeleteOptions } from '../types/delete-options';
import { TCountOptions } from '../types/count-options';
import { TReplaceOneOptions } from '../types/replace-one-options';

export interface ISequelizeService<W, R extends W, C> {
  getPrimaryKeyField(): string | number;
  create(object: W, options?: TCreateOptions<R, C>): Promise<R>;
  createMany(objects: W[], options?: TCreateOptions<R, C>): Promise<Collection<R>>;
  find<S extends keyof R>(filters: TFilters<R>, options?: TFindOptions<R, C, S>): Promise<Collection<Pick<R, S> & C>>;
  warn(condition: boolean, message: string, data?: object): void;
  findOne<S extends keyof R>(filters: TFilters<R>, options?: TFindOneOptions<R, C, S>): Promise<Pick<R, S> & C>;
  findByPrimaryKey<S extends keyof R>(pk: string | number, options?: TFindByPrimaryKeyOptions<R, C, S>): Promise<Pick<R, S> & C>;
  findByPrimaryKeys<S extends keyof R>(pks: string[] | number[], options?: TFindByPrimaryKeyOptions<R, C, S>): Promise<Collection<Pick<R, S> & C>>;
  update(filters: TFilters<R>, values: TValues<W>, options?: TUpdateOptions<R>): Promise<number>;
  updateByPrimaryKey(pk: string | number, values: TValues<W>, options?: TUpdateByPrimaryKeyOptions<R>): Promise<number>;
  delete(filters: TFilters<R>, options?: TDeleteOptions<R>): Promise<number>;
  count(filters: TFilters<R>, options?: TCountOptions<R>): Promise<number>;
  replaceOne(filters: TFilters<R>, values: W, options?: TReplaceOneOptions<R, C>): Promise<R & C>;
}