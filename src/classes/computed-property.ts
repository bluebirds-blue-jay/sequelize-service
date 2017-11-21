import { IComputedProperty } from '../interfaces/computed-property';
import { ISession } from '../interfaces/session';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { injectable } from 'inversify';

@injectable()
export abstract class ComputedProperty<W, R extends W, C, T = C[keyof C]> implements IComputedProperty<W, R, C, T> {
  public async abstract transform(session: ISession<W, R, C>, service: ISequelizeService<W, R, C>): Promise<void>;
}