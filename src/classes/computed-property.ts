import { IComputedProperty } from '../interfaces/computed-property';
import { ISession } from '../interfaces/sessions/session';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { injectable } from 'inversify';

@injectable()
export abstract class ComputedProperty<A, CP, T = CP[keyof CP]> implements IComputedProperty<A, CP, T> {
  public async abstract transform(session: ISession<A, CP>, service: ISequelizeService<A, CP>): Promise<void>;
}