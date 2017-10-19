import { SequelizeService } from '../../../../src/classes/sequelize-service';
import { TUser, TUserComputedProperties } from '../../types/user';
import { UserComputedPropertiesManager } from './computed-properties/index';

export class UserService extends SequelizeService<TUser, TUserComputedProperties> {
  protected computedPropertiesManager = new UserComputedPropertiesManager();
}