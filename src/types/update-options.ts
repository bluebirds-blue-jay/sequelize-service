import { TSafeOptions } from './safe-options';
import { TLimitOption } from './limit-option';

export type TUpdateOptions<A> = TSafeOptions & Partial<TLimitOption>;