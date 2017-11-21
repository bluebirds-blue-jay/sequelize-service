import { TSafeOptions } from './safe-options';
import { TComputeOption } from './compute-option';

export type TReplaceOneOptions<R, C> = TSafeOptions & Partial<TComputeOption<C>>;