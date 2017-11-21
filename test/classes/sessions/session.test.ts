import { Session } from '../../../';
import { TUserComputedProperties, TUserReadProperties, TUserWriteProperties } from '../../resources/types/user';
import { userService, database } from '../../resources';
import { TAllOptions } from '../../../src/types/all-options';
import { TSafeOptions } from '../../../src/types/safe-options';
import { TFilters } from '../../../src/types/filters';
import * as Sinon from 'sinon';
import { Collection } from '@bluejay/collection';

function createSession<O extends TSafeOptions = TAllOptions<TUserReadProperties, TUserComputedProperties, keyof TUserReadProperties, keyof TUserComputedProperties>>(
  params: { options?: TAllOptions<TUserReadProperties, TUserComputedProperties, keyof TUserReadProperties, keyof TUserComputedProperties>, objects?: Partial<TUserReadProperties>[], filters?: TFilters<TUserReadProperties> } = {}
): Session<TUserWriteProperties, TUserReadProperties, TUserComputedProperties, O> {
  return new Session<TUserWriteProperties, TUserReadProperties, TUserComputedProperties, O>(params.objects || [], (params.options || {}) as O, userService, params.filters || {});
}

describe('Session', function () {
  beforeEach(async () => {
    await database.reset();
  });

  describe('#getOptions()', function () {
    it('should return a map of options', () => {
      expect(createSession().getOptions()).to.be.instanceOf(Map);
    });
  });

  describe('#getContext()', function () {
    it('should return provided context', () => {
      const context = new Map();
      expect(createSession({ options: { context } }).getContext()).to.equal(context);
    });
    it('should have create a context', () => {
      expect(createSession().getContext()).to.be.instanceOf(Map);
    });
  });

  describe('#hasOption()', function () {
    it('should return true', () => {
      expect(createSession({ options: { context: new Map() } }).hasOption('context')).to.equal(true);
    });
    it('should return false', () => {
      expect(createSession().hasOption('context')).to.equal(false);
    });
  });

  describe('#setOption()', function () {
    it('should set option', () => {
      const session = createSession();
      session.setOption('context', new Map());
      expect(session.hasOption('context')).to.equal(true);
    });
  });

  describe('#unsetOption()', function () {
    it('should unset option', () => {
      const session = createSession({ options: { context: new Map() } });
      expect(session.hasOption('context')).to.equal(true);
      session.unsetOption('context');
      expect(session.hasOption('context')).to.equal(false);
    });
  });

  describe('#getSafeOptions()', function () {
    it('should only return safe options', () => {
      const session = createSession({ options: { transaction: null, context: null, skipHooks: true, select: ['id'] } });
      expect(session.getSafeOptions()).to.deep.equal({
        transaction: null,
        context: null,
        skipHooks: true
      });
    });
  });

  describe('#getFilters()', function () {
    it('should return a map', () => {
      expect(createSession().getFilters()).to.be.instanceOf(Map);
    });
  });

  describe('#getRawFilters()', function () {
    it('should return an object', () => {
      expect(createSession({ filters: { id: 1 } }).getRawFilters()).to.deep.equal({ id: 1 });
    });
  });

  describe('#hasFilters()', function () {
    it('should return true', () => {
      expect(createSession({ filters: { id: 1 } }).hasFilters()).to.equal(true);
    });
    it('should return false', () => {
      expect(createSession().hasFilters()).to.equal(false);
    });
  });

  describe('#hasFilter()', function () {
    it('should return true', () => {
      expect(createSession({ filters: { id: 1 } }).hasFilter('id')).to.equal(true);
    });
    it('should return false', () => {
      expect(createSession({ filters: { id: 1 } }).hasFilter('date_of_birth')).to.equal(false);
    });
  });

  describe('#isIdentified()', function () {
    it('should return true', () => {
      const session = createSession({ objects: [{ id: 1, email: 'foo', password: 'bar' }] });
      expect(session.isIdentified()).to.equal(true);
    });
    it('should return false', () => {
      const session = createSession({ objects: [{ email: 'foo', password: 'bar' }] });
      expect(session.isIdentified()).to.equal(false);
    });
    it('should return false (no objects)', () => {
      const session = createSession();
      expect(session.isIdentified()).to.equal(false);
    });
    it('should throw if inconsistently identified', () => {
      const session = createSession({ objects: [{ id: 1, email: 'foo', password: 'bar' }, { email: 'foo', password: 'bar' }] });
      expect(() => session.isIdentified()).to.throw(/inconsistent/i);
    });
  });

  describe('#fetch()', function () {
    it('should populate objects', async () => {
      await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' },
        { email: 'foo3', password: 'bar3' }
      ]);

      const session = createSession({ filters: { email: { in: ['foo1', 'foo2'] } } });
      expect(session.size()).to.equal(0);
      await session.fetch({ select: ['email'] });
      expect(session.size()).to.equal(2);
      session.forEach(object => expect(object).to.have.keys(['id', 'email']));
    });
    it('should update objects', async () => {
      await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' },
        { email: 'foo3', password: 'bar3' }
      ]);

      const session = createSession({ filters: { email: { in: ['foo1', 'foo2'] } } });
      await session.fetch({ select: ['email'] });
      expect(session.size()).to.equal(2);
      await session.fetch({ select: ['password'] });
      expect(session.size()).to.equal(2);
      session.forEach(object => expect(object).to.have.keys(['id', 'email', 'password']));
    });
    it('should throw if not finding an object', async () => {
      const [ user1 ] = await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' },
        { email: 'foo3', password: 'bar3' }
      ]);

      const session = createSession({ filters: { email: { in: ['foo1', 'foo2'] } } });
      await session.fetch({ select: ['email'] });

      const findStub = Sinon.stub(userService, 'find').callsFake(async () => {
        return new Collection([user1]);
      });

      try {
        await session.fetch({ select: ['password'] });
      } catch (err) {
        expect(err.message).to.match(/matching object/);
        findStub.restore();
        return;
      }

      throw new Error(`Should not pass here.`)
    });
  });

  describe('#ensureProperties()', function () {
    it('should fetch missing field', async () => {
      await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' },
        { email: 'foo3', password: 'bar3' }
      ]);

      const session = createSession({ filters: { email: { in: ['foo1', 'foo2'] } } });
      await session.fetch({ select: ['id'] });
      session.forEach(object => expect(object).to.have.keys(['id']));
      await session.ensureProperties({ select: ['email'] });
      session.forEach(object => expect(object).to.have.keys(['id', 'email']));
    });
    it('should NOT call find - properties are already present', async () => {
      await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' },
        { email: 'foo3', password: 'bar3' }
      ]);

      const session = createSession({ filters: { email: { in: ['foo1', 'foo2'] } } });
      await session.fetch({ select: ['id', 'email'] });
      const findStub = Sinon.stub(userService, 'find');
      await session.ensureProperties({ select: ['email'] });
      expect(findStub.callCount).to.equal(0);
      findStub.restore();
    });
  });

  describe('#ensureIdentified()', function () {
    it('should ensure primary key', async () => {
      await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' },
        { email: 'foo3', password: 'bar3' }
      ]);
      const session = createSession({ filters: { email: { in: ['foo1', 'foo2'] } } });
      await session.ensureIdentified();
      session.forEach(object => expect(object).to.have.keys(['id']));
    });
  });
});