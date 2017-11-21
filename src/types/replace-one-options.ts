import { TSafeOptions } from './safe-options';
import { TComputeOption } from './compute-option';

export type TReplaceOneOptions<R, C, Compute extends keyof C> = TSafeOptions & Partial<TComputeOption<Compute>>;