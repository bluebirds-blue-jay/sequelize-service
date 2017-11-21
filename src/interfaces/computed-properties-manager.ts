import { ISession } from './session';
import { ISequelizeService } from './sequelize-service';

export interface IComputedPropertiesManager<W, R extends W, C> {
  transform(session: ISession<W, R, C>, service: ISequelizeService<W, R, C>): Promise<void>
}