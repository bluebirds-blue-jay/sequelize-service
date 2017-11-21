import { ComputedProperty } from '../../../../../src/classes/computed-property';
import { TUserComputedProperties, TUserReadProperties, TUserWriteProperties } from '../../../types/user';
import { Session } from '../../../../../src/classes/session';

export class UserIsAdult extends ComputedProperty<TUserWriteProperties, TUserReadProperties, TUserComputedProperties, boolean> {
  public async transform(session: Session<TUserWriteProperties, TUserReadProperties, TUserComputedProperties>) {
    await session.ensureProperties(session.getSafeOptions({ compute: ['age'] }));
    session.forEach(object => {
      object.isAdult = object.age ? object.age >= 21 : null;
    });
  }
}