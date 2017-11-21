import { ISession } from './session';
import { ISequelizeService } from './sequelize-service';

export interface IComputedPropertiesManager<W extends {}, R extends W, C extends {}> {
  transform(session: ISession<W, R, C>, service: ISequelizeService<W, R, C>): Promise<void>
}