import { SequelizeService } from '../../../../src/classes/sequelize-service';
import { TUser, TUserComputedProperties } from '../../types/user';
import { DateOrBirth } from './computed-properties/date-of-birth';

export class UserService extends SequelizeService<TUser, TUserComputedProperties> {
  protected computedProperties = {
    date_of_birth: new DateOrBirth()
  };
}