import { TContextOption } from './context-option';
import { TTransactionOption } from './transaction-option';
import { TSkipHooksOption } from './skip-hooks-option';

export type TSafeOptions<CT extends {} = any> = Partial<TContextOption<CT> & TTransactionOption & TSkipHooksOption>;