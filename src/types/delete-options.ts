import { TSafeOptions } from './safe-options';
import { TLimitOption } from './limit-option';

export type TDeleteOptions<A> = TSafeOptions & Partial<TLimitOption>;