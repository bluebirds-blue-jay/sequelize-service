import { TSafeOptions } from './safe-options';
import { TComputeOption } from './compute-option';

export type TCreateOptions<R, C> = TSafeOptions & Partial<TComputeOption<C>>;