import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TDecorateOption } from './decorate-option';
import { TSortOption } from './sort-option';

export type TFindOneOptions<A> = TSafeOptions & Partial<TSelectOption<A> & TDecorateOption<A> & TSortOption<A>>;