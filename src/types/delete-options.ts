import { TSafeOptions } from './safe-options';
import { TLimitOption } from './limit-option';

export type TDeleteOptions<R> = TSafeOptions & Partial<TLimitOption>;