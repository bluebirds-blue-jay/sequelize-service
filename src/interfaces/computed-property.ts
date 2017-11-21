import { ISession } from './session';
import { ISequelizeService } from './sequelize-service';

export interface IComputedProperty<W, R extends W, C, T = C[keyof C]> {
  transform(session: ISession<W, R, C>, service: ISequelizeService<W, R, C>): Promise<void>;
}