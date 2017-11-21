import { Session } from './session';
import { TCreateOptions } from '../types/create-options';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { ICreateSession } from '../interfaces/create-session';

export class CreateSession<W extends {}, R extends W, C extends {}, KC extends keyof C> extends Session<W, R, C, TCreateOptions<R, C, KC>> implements ICreateSession<W, R, C, KC> {
  public constructor(objects: W[], options: TCreateOptions<R, C, KC>, service: ISequelizeService<W, R, C>) {
    super(objects, options, service);
  }
}