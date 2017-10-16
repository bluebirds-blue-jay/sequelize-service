import { Session } from './session';
import { TCreateOptions } from '../../types/create-options';
import { ISequelizeService } from '../../interfaces/sequelize-service';

export class CreateSession<A> extends Session<A, TCreateOptions<A>> {
  public constructor(objects: A[], options: TCreateOptions<A>, service: ISequelizeService<A, any>) {
    super(objects, options, service);
  }
}