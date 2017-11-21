import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TComputeOption } from './compute-option';
import { TSortOption } from './sort-option';
import { TTransactionOptions } from './transaction-options';

export type TFindOneOptions<R, C> = TSafeOptions & Partial<TSelectOption<R> & TComputeOption<C> & TSortOption<R> & TTransactionOptions & TComputeOption<C>>;