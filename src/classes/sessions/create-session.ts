import { Session } from './session';
import { TCreateOptions } from '../../types/create-options';
import { ISequelizeService } from '../../interfaces/sequelize-service';
import { ICreateSession } from '../../interfaces/sessions/create-session';

export class CreateSession<A, CP> extends Session<A, CP, TCreateOptions<A, CP>> implements ICreateSession<A, CP> {
  public constructor(objects: A[], options: TCreateOptions<A, CP>, service: ISequelizeService<A, CP>) {
    super(objects, options, service);
  }
}