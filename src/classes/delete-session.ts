import { Session } from './session';
import { TDeleteOptions } from '../types/delete-options';
import { TFilters } from '../types/filters';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { IDeleteSession } from '../interfaces/delete-session';

export class DeleteSession<W extends {}, R extends W, C extends {}, O extends {} = {}> extends Session<W, R, C, TDeleteOptions<R> & O> implements IDeleteSession<W, R, C, O> {
  public constructor(filters: TFilters<R>, options: TDeleteOptions<R> & O, service: ISequelizeService<W, R, C>) {
    super([], options, service, filters);
  }
}