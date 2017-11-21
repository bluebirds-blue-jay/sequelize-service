import { SortOrder } from '../constants/sort-order';

export type TSort<R> = (keyof R | [keyof R, SortOrder])[];