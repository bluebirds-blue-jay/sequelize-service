import { TContextOption } from './context-option';
import { TTransactionOption } from './transaction-option';
import { TSkipHooksOption } from './skip-hooks-option';

export type TSafeOptions = Partial<TContextOption & TTransactionOption & TSkipHooksOption>;