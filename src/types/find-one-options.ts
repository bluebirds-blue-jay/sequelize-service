import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TComputeOption } from './compute-option';
import { TSortOption } from './sort-option';
import { TTransactionOptions } from './transaction-options';
import { TParanoidOption } from './paranoid-option';

export type TFindOneOptions<R, C, KR, KC> = TSafeOptions & Partial<TSelectOption<KR> & TComputeOption<KC> & TSortOption<R> & TTransactionOptions & TParanoidOption>;