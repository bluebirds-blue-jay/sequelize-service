import { SequelizeService } from '../../../../src/classes/sequelize-service';
import { TUserComputedProperties, TUserReadProperties, TUserWriteProperties } from '../../types/user';
import { UserComputedPropertiesManager } from './computed-properties';

export class UserService extends SequelizeService<TUserWriteProperties, TUserReadProperties, TUserComputedProperties> {
  protected computedPropertiesManager = new UserComputedPropertiesManager();
}