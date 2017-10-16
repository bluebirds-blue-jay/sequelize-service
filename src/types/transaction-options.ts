import { TTransactionOption } from './transaction-option';
import { TTransactionIsolationLevelOption } from './transaction-isolation-level-option';

export type TTransactionOptions = Partial<TTransactionOption & TTransactionIsolationLevelOption>;