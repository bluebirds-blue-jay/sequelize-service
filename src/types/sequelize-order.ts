import { SortOrder } from '../constants/sort-order';

export type TSequelizeOrder<T> = [keyof T, SortOrder][];