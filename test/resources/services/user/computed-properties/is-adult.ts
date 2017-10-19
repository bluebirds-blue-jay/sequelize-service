import { ComputedProperty } from '../../../../../src/classes/computed-property';
import { TUser, TUserComputedProperties } from '../../../types/user';
import { Session } from '../../../../../src/classes/sessions/session';

export class UserIsAdult extends ComputedProperty<TUser, TUserComputedProperties, boolean> {
  public async transform(session: Session<TUser, TUserComputedProperties>) {
    await session.ensureProperties(session.getSafeOptions({ compute: ['age'] }));
    session.forEach(object => {
      object.isAdult = object.age ? object.age >= 21 : null;
    });
  }
}