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

export interface ISequelizeService<W extends {}, R extends W, C extends {}> {
  getPrimaryKeyField(): string | number;
  create<KR extends keyof R, KC extends keyof C = keyof {}>(object: W, options?: TCreateOptions<R, C, KC>): Promise<R & Pick<C, KC>>;
  createMany<KR extends keyof R, KC extends keyof C = keyof {}>(objects: W[], options?: TCreateOptions<R, C, KC>): Promise<Collection<R & Pick<C, KC>>>;
  find<KR extends keyof R, KC extends keyof C = keyof {}>(filters: TFilters<R>, options?: TFindOptions<R, C, KR, KC>): Promise<Collection<Pick<R, KR> & Pick<C, KC>>>;
  warn(condition: boolean, message: string, data?: object): void;
  findOne<KR extends keyof R, KC extends keyof C = keyof {}>(filters: TFilters<R>, options?: TFindOneOptions<R, C, KR, KC>): Promise<Pick<R, KR> & Pick<C, KC>>;
  findByPrimaryKey<KR extends keyof R, KC extends keyof C = keyof {}>(pk: string | number, options?: TFindByPrimaryKeyOptions<R, C, KR, KC>): Promise<Pick<R, KR> & Pick<C, KC>>;
  findByPrimaryKeys<KR extends keyof R, KC extends keyof C = keyof {}>(pks: string[] | number[], options?: TFindByPrimaryKeyOptions<R, C, KR, KC>): Promise<Collection<Pick<R, KR> & Pick<C, KC>>>;
  update(filters: TFilters<R>, values: TValues<W>, options?: TUpdateOptions<R>): Promise<number>;
  updateByPrimaryKey(pk: string | number, values: TValues<W>, options?: TUpdateByPrimaryKeyOptions<R>): Promise<number>;
  delete(filters: TFilters<R>, options?: TDeleteOptions<R>): Promise<number>;
  count(filters: TFilters<R>, options?: TCountOptions<R>): Promise<number>;
  replaceOne<KR extends keyof R, KC extends keyof C = keyof {}>(filters: TFilters<R>, values: W, options?: TReplaceOneOptions<R, C, KC>): Promise<R & Pick<C, KC>>;
}