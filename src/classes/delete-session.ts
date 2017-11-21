import { Session } from './session';
import { TDeleteOptions } from '../types/delete-options';
import { TFilters } from '../types/filters';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { IDeleteSession } from '../interfaces/delete-session';

export class DeleteSession<W, R extends W, C> extends Session<W, R, C, TDeleteOptions<R>> implements IDeleteSession<W, R, C> {
  public constructor(filters: TFilters<R>, options: TDeleteOptions<R>, service: ISequelizeService<W, R, C>) {
    super([], options, service, filters);
  }
}