import { ISequelizeService } from './sequelize-service';
import { ISession } from './session';

export interface IComputedPropertiesManager<W extends {}, R extends W, C extends {}> {
  transform(session: ISession<W, R, C>, service: ISequelizeService<W, R, C>): Promise<void>;
}
