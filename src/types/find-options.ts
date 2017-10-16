import { TSafeOptions } from './safe-options';
import { TSelectOption } from './select-option';
import { TDecorateOption } from './decorate-option';
import { TSortOption } from './sort-option';
import { TLimitOption } from './limit-option';
import { TOffsetOption } from './offset-option';

export type TFindOptions<T> = TSafeOptions & Partial<TDecorateOption<T> & TSelectOption<T> & TSortOption<T> & TLimitOption & TOffsetOption>;