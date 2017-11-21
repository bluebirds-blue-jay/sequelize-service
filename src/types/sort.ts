import { SortOrder } from '../constants/sort-order';

export type TSort<T> = (keyof T | [keyof T, SortOrder])[];