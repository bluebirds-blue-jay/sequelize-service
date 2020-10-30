import { injectable } from 'inversify';
import { IComputedProperty } from '../interfaces/computed-property';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { ISession } from '../interfaces/session';

@injectable()
export abstract class ComputedProperty<W extends {}, R extends W, C extends {}, T = C[keyof C]> implements IComputedProperty<W, R, C, T> {
  public abstract async transform(session: ISession<W, R, C>, service: ISequelizeService<W, R, C>): Promise<void>;
}
