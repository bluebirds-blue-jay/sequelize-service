import { Session } from './session';
import { TDeleteOptions } from '../../types/delete-options';
import { TFilters } from '../../types/filters';
import { ISequelizeService } from '../../interfaces/sequelize-service';
import { IDeleteSession } from '../../interfaces/sessions/delete-session';

export class DeleteSession<A, CP> extends Session<A, CP, TDeleteOptions<A>> implements IDeleteSession<A, CP> {
  public constructor(filters: TFilters<A>, options: TDeleteOptions<A>, service: ISequelizeService<A, CP>) {
    super([], options, service, filters);
  }
}