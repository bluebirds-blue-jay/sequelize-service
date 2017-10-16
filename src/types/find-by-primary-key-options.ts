import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TDecorateOption } from './decorate-option';

export type TFindByPrimaryKeyOptions<A> = TSafeOptions & Partial<TSelectOption<A> & TDecorateOption<A>>;