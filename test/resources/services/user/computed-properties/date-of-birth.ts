import { ComputedProperty } from '../../../../../src/classes/computed-property';
import { TUser, TUserComputedProperties } from '../../../types/user';
import { Session } from '../../../../../src/classes/sessions/session';
import * as moment from 'moment';

export class DateOrBirth extends ComputedProperty<TUser, TUserComputedProperties, Date> {
  public async transform(session: Session<TUser, TUserComputedProperties>) {
    await session.ensureProperties({ select: ['age'] });
    for (const object of session) {
      object.date_of_birth = object.age ? moment().subtract(object.age, 'years').toDate() : null;
    }
  }
}