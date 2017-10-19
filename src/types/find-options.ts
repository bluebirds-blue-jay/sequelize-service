import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TComputeOption } from './compute-option';
import { TSortOption } from './sort-option';
import { TLimitOption } from './limit-option';
import { TOffsetOption } from './offset-option';
import { TTransactionOptions } from './transaction-options';

export type TFindOptions<A, CP> = TSafeOptions & Partial<TComputeOption<CP> & TSelectOption<A> & TSortOption<A> & TLimitOption & TOffsetOption & TTransactionOptions>;