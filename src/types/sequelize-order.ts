import { SortOrder } from '../constants/sort-order';

export type TSequelizeOrder<A> = [keyof A, SortOrder][];