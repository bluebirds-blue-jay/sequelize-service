import { ComputedPropertiesManager } from '../../../../../src/classes/computed-properties-manager';
import { TUserComputedProperties, TUserReadProperties, TUserWriteProperties } from '../../../types/user';
import { UserAge } from './age';
import { UserIsAdult } from './is-adult';

export class UserComputedPropertiesManager extends ComputedPropertiesManager<TUserWriteProperties, TUserReadProperties, TUserComputedProperties> {
  protected map() {
    return {
      age: new UserAge(),
      isAdult: { property: new UserIsAdult(), dependencies: <(keyof TUserComputedProperties)[]>['age'] }
    };
  }
}