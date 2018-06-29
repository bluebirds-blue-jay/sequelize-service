import { TParanoidOption } from './paranoid-option';
import { TSafeOptions } from './safe-options';

export type TCountOptions<R> = TSafeOptions & Partial<TParanoidOption>;