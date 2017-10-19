import { ISession } from './sessions/session';
import { ISequelizeService } from './sequelize-service';

export interface IComputedProperty<A, CP, T> {
  transform(session: ISession<A, CP>, service: ISequelizeService<A, CP>): Promise<void>;
}