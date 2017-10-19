import { IComputedProperty } from '../interfaces/computed-property';
import { ISession } from '../interfaces/sessions/session';

export abstract class ComputedProperty<A, CP, T> implements IComputedProperty<A, CP, T> {
  public async abstract transform(session: ISession<A, CP>): Promise<void>;
}