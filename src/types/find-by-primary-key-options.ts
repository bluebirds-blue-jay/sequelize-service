import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TDecorateOption } from './decorate-option';
import { TTransactionIsolationLevelOption } from './transaction-isolation-level-option';

export type TFindByPrimaryKeyOptions<A> = TSafeOptions & Partial<TSelectOption<A> & TDecorateOption<A> & TTransactionIsolationLevelOption>;