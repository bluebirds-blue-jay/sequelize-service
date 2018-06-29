import { TParanoidOption } from './paranoid-option';
import { TSafeOptions } from './safe-options';
import { TLimitOption } from './limit-option';

export type TUpdateOptions<R> = TSafeOptions & Partial<TLimitOption & TParanoidOption>;