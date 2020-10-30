import { IDeleteSession } from '../interfaces/delete-session';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { TDeleteOptions } from '../types/delete-options';
import { TFilters } from '../types/filters';
import { Session } from './session';

export class DeleteSession<W extends {}, R extends W, C extends {}, O extends {} = {}> extends Session<W, R, C, TDeleteOptions<R> & O> implements IDeleteSession<W, R, C, O> {
  public constructor(filters: TFilters<R>, options: TDeleteOptions<R> & O, service: ISequelizeService<W, R, C>) {
    super([], options, service, filters);
  }
}
