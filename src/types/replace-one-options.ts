import { TSafeOptions } from './safe-options';
import { TComputeOption } from './compute-option';

export type TReplaceOneOptions<R, C, KC extends keyof C> = TSafeOptions & Partial<TComputeOption<KC>>;