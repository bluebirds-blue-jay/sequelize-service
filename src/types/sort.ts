import { SortOrder } from '../constants/sort-order';

export type TSort<A> = (keyof A | [keyof A, SortOrder])[];