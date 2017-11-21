import { Session } from './session';
import { TCreateOptions } from '../types/create-options';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { ICreateSession } from '../interfaces/create-session';

export class CreateSession<W, R extends W, C, Compute extends keyof C> extends Session<W, R, C, TCreateOptions<R, C, Compute>> implements ICreateSession<W, R, C, Compute> {
  public constructor(objects: W[], options: TCreateOptions<R, C, Compute>, service: ISequelizeService<W, R, C>) {
    super(objects, options, service);
  }
}