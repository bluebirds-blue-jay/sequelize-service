import { TTransactionOption } from './transaction-option';
import { TTransactionIsolationLevelOption } from './transaction-isolation-level-option';
import { TTransactionLockOption } from './transaction-lock-option';

export type TTransactionOptions = Partial<TTransactionOption & TTransactionIsolationLevelOption & TTransactionLockOption>;