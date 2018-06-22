import { TSafeOptions } from './safe-options';
import { TComputeOption } from './compute-option';

export type TCreateOptions<R, C, KC extends keyof C = keyof C> = TSafeOptions & Partial<TComputeOption<KC>>;