import { TSafeOptions } from './safe-options';
import { TComputeOption } from './compute-option';

export type TCreateOptions<A, CP> = TSafeOptions & Partial<TComputeOption<CP>>;