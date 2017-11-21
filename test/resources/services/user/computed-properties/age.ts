import { ComputedProperty } from '../../../../../src/classes/computed-property';
import { TUserComputedProperties, TUserReadProperties, TUserWriteProperties } from '../../../types/user';
import { Session } from '../../../../../src/classes/session';
import * as moment from 'moment';

export class UserAge extends ComputedProperty<TUserWriteProperties, TUserReadProperties, TUserComputedProperties, number> {
  public async transform(session: Session<TUserWriteProperties, TUserReadProperties, TUserComputedProperties>) {
    await session.ensureProperties(session.getSafeOptions({ select: ['date_of_birth'] }));
    for (const object of session) {
      object.age = object.date_of_birth ? moment.duration(moment().diff(object.date_of_birth)).get('years') : null;
    }
  }
}