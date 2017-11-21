import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TComputeOption } from './compute-option';
import { TSortOption } from './sort-option';
import { TLimitOption } from './limit-option';
import { TOffsetOption } from './offset-option';
import { TTransactionOptions } from './transaction-options';

export type TFindOptions<R, C> = TSafeOptions & Partial<TComputeOption<C> & TSelectOption<R> & TSortOption<R> & TLimitOption & TOffsetOption & TTransactionOptions>;