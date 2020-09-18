import { TLimitOption } from './limit-option';
import { TParanoidOption } from './paranoid-option';
import { TSafeOptions } from './safe-options';

export type TUpdateOptions<R> = TSafeOptions & Partial<TLimitOption & TParanoidOption>;
