import { Session } from './session';
import { TDeleteOptions } from '../../types/delete-options';
import { TFilters } from '../../types/filters';
import { ISequelizeService } from '../../interfaces/sequelize-service';

export class DeleteSession<A> extends Session<A, TDeleteOptions<A>> {
  public constructor(filters: TFilters<A>, options: TDeleteOptions<A>, service: ISequelizeService<A>) {
    super([], options, service, filters);
  }
}