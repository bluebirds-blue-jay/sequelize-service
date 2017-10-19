import { TSafeOptions } from './safe-options';
import { TComputeOption } from './compute-option';

export type TReplaceOneOptions<A, CP> = TSafeOptions & Partial<TComputeOption<CP>>;