import { ICreateSession } from '../interfaces/create-session';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { TCreateOptions } from '../types/create-options';
import { Session } from './session';

export class CreateSession<W extends {}, R extends W, C extends {}, KC extends keyof C, O extends {} = {}> extends Session<W, R, C, TCreateOptions<R, C, KC> & O> implements ICreateSession<W, R, C, KC, O> {
  public constructor(objects: W[], options: TCreateOptions<R, C, KC> & O, service: ISequelizeService<W, R, C>) {
    super(objects, options, service);
  }
}
