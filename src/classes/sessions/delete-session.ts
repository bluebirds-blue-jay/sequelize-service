import { Session } from './session';
import { TDeleteOptions } from '../../types/delete-options';
import { TFilters } from '../../types/filters';
import { ISequelizeService } from '../../interfaces/sequelize-service';

export class DeleteSession<A, CP> extends Session<A, CP, TDeleteOptions<A>> {
  public constructor(filters: TFilters<A>, options: TDeleteOptions<A>, service: ISequelizeService<A, CP>) {
    super([], options, service, filters);
  }
}