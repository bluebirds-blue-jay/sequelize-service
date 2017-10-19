import { ComputedPropertiesManager } from '../../../../../src/classes/computed-properties-manager';
import { TUser, TUserComputedProperties } from '../../../types/user';
import { UserAge } from './age';
import { UserIsAdult } from './is-adult';

export class UserComputedPropertiesManager extends ComputedPropertiesManager<TUser, TUserComputedProperties> {
  protected map() {
    return {
      age: new UserAge(),
      isAdult: { property: new UserIsAdult(), dependencies: <(keyof TUserComputedProperties)[]>['age'] }
    };
  }
}