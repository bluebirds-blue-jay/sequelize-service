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
  create<Select extends keyof R, Compute extends keyof C = undefined>(object: W, options?: TCreateOptions<R, C, Compute>): Promise<R & Pick<C, Compute>>;
  createMany<Select extends keyof R, Compute extends keyof C = undefined>(objects: W[], options?: TCreateOptions<R, C, Compute>): Promise<Collection<R & Pick<C, Compute>>>;
  find<Select extends keyof R, Compute extends keyof C = undefined>(filters: TFilters<R>, options?: TFindOptions<R, C, Select, Compute>): Promise<Collection<Pick<R, Select> & Pick<C, Compute>>>;
  warn(condition: boolean, message: string, data?: object): void;
  findOne<Select extends keyof R, Compute extends keyof C = undefined>(filters: TFilters<R>, options?: TFindOneOptions<R, C, Select, Compute>): Promise<Pick<R, Select> & Pick<C, Compute>>;
  findByPrimaryKey<Select extends keyof R, Compute extends keyof C = undefined>(pk: string | number, options?: TFindByPrimaryKeyOptions<R, C, Select, Compute>): Promise<Pick<R, Select> & Pick<C, Compute>>;
  findByPrimaryKeys<Select extends keyof R, Compute extends keyof C = undefined>(pks: string[] | number[], options?: TFindByPrimaryKeyOptions<R, C, Select, Compute>): Promise<Collection<Pick<R, Select> & Pick<C, Compute>>>;
  update(filters: TFilters<R>, values: TValues<W>, options?: TUpdateOptions<R>): Promise<number>;
  updateByPrimaryKey(pk: string | number, values: TValues<W>, options?: TUpdateByPrimaryKeyOptions<R>): Promise<number>;
  delete(filters: TFilters<R>, options?: TDeleteOptions<R>): Promise<number>;
  count(filters: TFilters<R>, options?: TCountOptions<R>): Promise<number>;
  replaceOne<Select extends keyof R, Compute extends keyof C = undefined>(filters: TFilters<R>, values: W, options?: TReplaceOneOptions<R, C, Compute>): Promise<R & Pick<C, Compute>>;
}