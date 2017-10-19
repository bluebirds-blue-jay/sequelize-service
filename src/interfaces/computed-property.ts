import { ISession } from './sessions/session';

export interface IComputedProperty<A, CP, T> {
  transform(session: ISession<A, CP>): Promise<void>;
}