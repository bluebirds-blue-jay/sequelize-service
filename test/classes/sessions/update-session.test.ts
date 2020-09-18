import { expect } from 'chai';

import { UpdateSession } from '../../../src';
import { TValues } from '../../../src/types/values';
import { userService } from '../../resources';
import { TUserComputedProperties, TUserReadProperties, TUserWriteProperties } from '../../resources/types/user';

function createSession(params: { values?: TValues<TUserWriteProperties> } = {}): UpdateSession<TUserWriteProperties, TUserReadProperties, TUserComputedProperties> {
  return new UpdateSession({}, params.values || {}, {}, userService);
}

describe('UpdateSession', function () {
  describe('#getValues()', function () {
    it('should return a map', () => {
      expect(createSession().getValues()).to.be.instanceOf(Map);
    });
  });

  describe('#getValue()', function () {
    it('should return existing values', () => {
      expect(createSession({ values: { email: 'john@doe.com' } }).getValue('email')).to.equal('john@doe.com');
    });
  });

  describe('#hasValue()', function () {
    it('should return true', () => {
      expect(createSession({ values: { email: 'john@doe.com' } }).hasValue('email')).to.equal(true);
    });
    it('should return false', () => {
      expect(createSession({ values: { first_name: 'John' } }).hasValue('email')).to.equal(false);
    });
  });

  describe('#setValue()', function () {
    it('should set value', () => {
      const session = createSession();
      session.setValue('first_name', 'John');
      expect(session.getValue('first_name')).to.equal('John');
    });
  });
});
