import { TComputeOption } from './compute-option';
import { TSafeOptions } from './safe-options';
import { TUpsertKeysOption } from './upsert-keys-option';

export type TUpsertOptions<R, C, KC extends keyof C = keyof C> = TSafeOptions & Partial<TComputeOption<KC>> & Partial<TUpsertKeysOption<R>>;
