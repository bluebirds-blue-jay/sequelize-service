import { UpdateSession } from '../../../';
import { TUser } from '../../resources/types/user';
import { userService } from '../../resources/index';
import { TValues } from '../../../src/types/values';

function createSession(params: { values?: TValues<TUser> } = {}): UpdateSession<TUser> {
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
      expect(createSession({ values: { id: 1 } }).getValue('id')).to.equal(1);
    });
  });

  describe('#hasValue()', function () {
    it('should return true', () => {
      expect(createSession({ values: { id: 1 } }).hasValue('id')).to.equal(true);
    });
    it('should return false', () => {
      expect(createSession({ values: { id: 1 } }).hasValue('email')).to.equal(false);
    });
  });

  describe('#setValue()', function () {
    it('should set value', () => {
      const session = createSession();
      session.setValue('id', 1);
      expect(session.getValue('id')).to.equal(1);
    });
  });
});