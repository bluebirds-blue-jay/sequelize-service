import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TComputeOption } from './compute-option';
import { TSortOption } from './sort-option';
import { TTransactionOptions } from './transaction-options';

export type TFindOneOptions<A, CP> = TSafeOptions & Partial<TSelectOption<A> & TComputeOption<CP> & TSortOption<A> & TTransactionOptions & TComputeOption<CP>>;