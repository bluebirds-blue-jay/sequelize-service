import { TComputeOption } from './compute-option';
import { TParanoidOption } from './paranoid-option';
import { TSafeOptions } from './safe-options';

export type TReplaceOneOptions<R, C, KC extends keyof C> = TSafeOptions & Partial<TComputeOption<KC> & TParanoidOption>;