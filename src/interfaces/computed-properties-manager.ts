import { ISession } from './session';
import { ISequelizeService } from './sequelize-service';

export interface IComputedPropertiesManager<A, CP> {
  transform(session: ISession<A, CP>, service: ISequelizeService<A, CP>): Promise<void>
}