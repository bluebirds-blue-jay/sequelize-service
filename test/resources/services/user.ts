import { SequelizeService } from '../../../src/classes/sequelize-service';
import { TUser } from '../types/user';
import { Session } from '../../../src/classes/sessions/session';
import * as moment from 'moment';

export class UserService extends SequelizeService<TUser> {
  protected async decorate(session: Session<TUser>) {
    if (session.hasDecoration('date_of_birth')) {
      await session.ensureProperties({ select: ['age'] });
      for (const object of session) {
        object.date_of_birth = object.age ? moment().subtract(object.age, 'years').toDate() : null;
      }
    }
  }
}