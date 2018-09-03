import { TTransactionIsolationLevelOption } from './transaction-isolation-level-option';
import { TTransactionLockOption } from './transaction-lock-option';
import { TTransactionOption } from './transaction-option';
import { TTransactionReadOnlyOption } from './transaction-read-only-option';

export type TTransactionOptions = Partial<TTransactionOption & TTransactionIsolationLevelOption & TTransactionLockOption & TTransactionReadOnlyOption>;