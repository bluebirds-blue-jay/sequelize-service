import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TComputeOption } from './compute-option';
import { TTransactionIsolationLevelOption } from './transaction-isolation-level-option';
import { TParanoidOption } from './paranoid-option';
import { TTransactionOption } from './transaction-option';

export type TFindByPrimaryKeyOptions<R, C, KR, KC> = TSafeOptions & Partial<TSelectOption<KR> & TComputeOption<KC> & TTransactionIsolationLevelOption & TParanoidOption & TTransactionOption>;