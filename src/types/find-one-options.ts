import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TComputeOption } from './compute-option';
import { TSortOption } from './sort-option';
import { TTransactionOptions } from './transaction-options';

export type TFindOneOptions<R, C, Select, Compute> = TSafeOptions & Partial<TSelectOption<Select> & TComputeOption<Compute> & TSortOption<R> & TTransactionOptions>;