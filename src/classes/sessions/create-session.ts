import { Session } from './session';
import { TCreateOptions } from '../../types/create-options';
import { ISequelizeService } from '../../interfaces/sequelize-service';

export class CreateSession<A, CP> extends Session<A, CP, TCreateOptions<A>> {
  public constructor(objects: A[], options: TCreateOptions<A>, service: ISequelizeService<A, CP>) {
    super(objects, options, service);
  }
}