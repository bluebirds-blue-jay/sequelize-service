import { SortOrder } from '../constants/sort-order';

export type TSequelizeOrder<R> = [keyof R, SortOrder][];