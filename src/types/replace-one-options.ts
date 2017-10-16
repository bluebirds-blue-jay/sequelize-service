import { TSafeOptions } from './safe-options';
import { TDecorateOption } from './decorate-option';

export type TReplaceOneOptions<A> = TSafeOptions & Partial<TDecorateOption<A>>;