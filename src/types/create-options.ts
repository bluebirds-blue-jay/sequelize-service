import { TComputeOption } from './compute-option';
import { TSafeOptions } from './safe-options';

export type TCreateOptions<R, C, KC extends keyof C = keyof C> = TSafeOptions & Partial<TComputeOption<KC>>;
