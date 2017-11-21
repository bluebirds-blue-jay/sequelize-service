import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TComputeOption } from './compute-option';
import { TTransactionIsolationLevelOption } from './transaction-isolation-level-option';

export type TFindByPrimaryKeyOptions<R, C, KR, KC> = TSafeOptions & Partial<TSelectOption<KR> & TComputeOption<KC> & TTransactionIsolationLevelOption>;  // TODO Add "& TTransactionOption:"