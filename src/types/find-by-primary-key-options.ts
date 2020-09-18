import { TComputeOption } from './compute-option';
import { TParanoidOption } from './paranoid-option';
import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TTransactionOptions } from './transaction-options';

export type TFindByPrimaryKeyOptions<R, C, KR extends keyof R = keyof R, KC extends keyof C = keyof C> = TSafeOptions & Partial<TSelectOption<KR> & TComputeOption<KC> & TTransactionOptions & TParanoidOption>;
