import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TComputeOption } from './compute-option';
import { TSortOption } from './sort-option';
import { TTransactionOptions } from './transaction-options';

export type TFindOneOptions<R, C, S> = TSafeOptions & Partial<TSelectOption<S> & TComputeOption<C> & TSortOption<R> & TTransactionOptions & TComputeOption<C>>;