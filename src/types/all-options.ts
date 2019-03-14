import { TContextOption } from './context-option';
import { TComputeOption } from './compute-option';
import { TSkipHooksOption } from './skip-hooks-option';
import { TSelectOption } from './select-option';
import { TSortOption } from './sort-option';
import { TLimitOption } from './limit-option';
import { TOffsetOption } from './offset-option';
import { TTransactionOptions } from './transaction-options';
import { TParanoidOption } from './paranoid-option';
import { TUpsertKeysOption } from './upsert-keys-option';
import { TUseMasterOption } from './use-master-option';

export type TAllOptions<R, C, KR, KC, CT extends {} = any> = Partial<
  TContextOption<CT> &
  TTransactionOptions &
  TComputeOption<KC> &
  TSkipHooksOption &
  TSelectOption<KR> &
  TSortOption<R> &
  TLimitOption &
  TOffsetOption &
  TParanoidOption &
  TUseMasterOption &
  TUpsertKeysOption<C>
>;