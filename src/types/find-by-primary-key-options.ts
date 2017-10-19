import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TComputeOption } from './compute-option';
import { TTransactionIsolationLevelOption } from './transaction-isolation-level-option';

export type TFindByPrimaryKeyOptions<A, CP> = TSafeOptions & Partial<TSelectOption<A> & TComputeOption<CP> & TTransactionIsolationLevelOption>;