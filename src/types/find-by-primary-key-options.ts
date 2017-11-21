import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TComputeOption } from './compute-option';
import { TTransactionIsolationLevelOption } from './transaction-isolation-level-option';

export type TFindByPrimaryKeyOptions<R, C> = TSafeOptions & Partial<TSelectOption<R> & TComputeOption<C> & TTransactionIsolationLevelOption>;