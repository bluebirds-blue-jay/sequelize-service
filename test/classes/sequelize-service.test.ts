import { database, userService } from '../resources';
import * as Sinon from 'sinon';
import { Hook } from '../../src/constants/hook';
import { RestError } from '@bluejay/rest-errors';
import { SequelizeService } from '../..';
import { TUser } from '../resources/types/user';
import { Utils } from '@bluejay/utils';
import { Collection } from '@bluejay/collection';
import * as Sequelize from 'sequelize';
import { Session } from '../../src/classes/sessions/session';
import { SortOrder } from '../../src/constants/sort-order';

function testFindMethod<A>(fetch: () => Promise<A[]>, ) {

}

describe('SequelizeService', function () {
  beforeEach(async () => {
    await database.reset();
  });

  describe('.try()', () => {
    it('should throw a formatted error', async () => {
      try {
        await SequelizeService.try(async () => {
          const err = new Error();
          err.name = 'SequelizeUniqueConstraintError';
          (err as any).errors = [{ path: 'foo' }];
          throw err;
        });
      } catch(err) {
        expect((err as RestError).statusCode).to.equal(409);
        return;
      }
      throw new Error(`Should not pass here`);
    });
  });

  describe('.formatError()', () => {
    it('should format SequelizeUniqueConstraintError', () => {
      const err = new Error();
      err.name = 'SequelizeUniqueConstraintError';
      (err as any).errors = [{ path: 'foo' }];
      expect((SequelizeService.formatError(err) as RestError).statusCode).to.equal(409);
    });
    it('should format SequelizeValidationError', () => {
      const err = new Error();
      err.name = 'SequelizeValidationError';
      (err as any).errors = [{ message: 'foo' }];
      expect((SequelizeService.formatError(err) as RestError).statusCode).to.equal(400);
    });
    it('should format SequelizeForeignKeyConstraintError', () => {
      const err = new Error();
      err.name = 'SequelizeForeignKeyConstraintError';
      (err as any).index = 'foo';
      expect((SequelizeService.formatError(err) as RestError).statusCode).to.equal(400);
    });
  });

  describe('#create()', function () {
    it('should create a new object', async () => {
      const properties = { email: 'foo', password: 'bar' };
      const object = await userService.create(properties);
      expect(object).to.containSubset(properties);
    });
    it('should call hooks', async () => {
      let calledBefore = false;
      let calledAfter = false;
      const beforeCreateStub = Sinon.stub(userService, 'beforeCreate' as any);
      const afterCreateStub = Sinon.stub(userService, 'afterCreate' as any);
      const transformStub = Sinon.stub(userService, 'transform' as any);
      const decorateStub = Sinon.stub(userService, 'decorate' as any);
      userService.subscribe(Hook.DID_CREATE, () => calledBefore = true);
      userService.subscribe(Hook.WILL_CREATE, () => calledAfter = true);

      await userService.create({ email: 'foo', password: 'bar' });

      expect(beforeCreateStub.calledOnce).to.equal(true);
      expect(afterCreateStub.calledOnce).to.equal(true);
      expect(transformStub.calledOnce).to.equal(true);
      expect(decorateStub.calledOnce).to.equal(true);
      expect(calledBefore).to.equal(true);
      expect(calledAfter).to.equal(true);

      beforeCreateStub.restore();
      afterCreateStub.restore();
      transformStub.restore();
      decorateStub.restore();
    });
    it('should skip hooks', async () => {
      let calledBefore = false;
      let calledAfter = false;
      const beforeCreateStub = Sinon.stub(userService, 'beforeCreate' as any);
      const afterCreateStub = Sinon.stub(userService, 'afterCreate' as any);
      const transformStub = Sinon.stub(userService, 'transform' as any);
      const decorateStub = Sinon.stub(userService, 'decorate' as any);
      userService.subscribe(Hook.DID_CREATE, () => calledBefore = true);
      userService.subscribe(Hook.WILL_CREATE, () => calledAfter = true);

      await userService.create({ email: 'foo', password: 'bar' }, { skipHooks: true });

      expect(beforeCreateStub.callCount).to.equal(0);
      expect(afterCreateStub.callCount).to.equal(0);
      expect(transformStub.callCount).to.equal(0);
      expect(decorateStub.callCount).to.equal(0);
      expect(calledBefore).to.equal(false);
      expect(calledAfter).to.equal(false);

      beforeCreateStub.restore();
      afterCreateStub.restore();
      transformStub.restore();
      decorateStub.restore();
    });
  });

  describe('#createMany()', function () {
    it('should create multiple objects', async () => {
      const first = { email: 'foo1', password: 'bar1' };
      const second = { email: 'foo2', password: 'bar2' };
      const objects = await userService.createMany([first, second]);
      expect(objects.getAt(0)).to.containSubset(first);
      expect(objects.getAt(1)).to.containSubset(second);
    });
    it('should call hooks', async () => {
      let calledBefore = false;
      let calledAfter = false;
      const beforeCreateStub = Sinon.stub(userService, 'beforeCreate' as any);
      const afterCreateStub = Sinon.stub(userService, 'afterCreate' as any);
      const transformStub = Sinon.stub(userService, 'transform' as any);
      const decorateStub = Sinon.stub(userService, 'decorate' as any);
      userService.subscribe(Hook.DID_CREATE, () => calledBefore = true);
      userService.subscribe(Hook.WILL_CREATE, () => calledAfter = true);

      await userService.createMany([{ email: 'foo', password: 'bar' }]);

      expect(beforeCreateStub.calledOnce).to.equal(true);
      expect(afterCreateStub.calledOnce).to.equal(true);
      expect(transformStub.calledOnce).to.equal(true);
      expect(decorateStub.calledOnce).to.equal(true);
      expect(calledBefore).to.equal(true);
      expect(calledAfter).to.equal(true);

      beforeCreateStub.restore();
      afterCreateStub.restore();
      transformStub.restore();
      decorateStub.restore();
    });
    it('should skip hooks', async () => {
      let calledBefore = false;
      let calledAfter = false;
      const beforeCreateStub = Sinon.stub(userService, 'beforeCreate' as any);
      const afterCreateStub = Sinon.stub(userService, 'afterCreate' as any);
      const transformStub = Sinon.stub(userService, 'transform' as any);
      const decorateStub = Sinon.stub(userService, 'decorate' as any);
      userService.subscribe(Hook.DID_CREATE, () => calledBefore = true);
      userService.subscribe(Hook.WILL_CREATE, () => calledAfter = true);

      await userService.createMany([{ email: 'foo', password: 'bar' }], { skipHooks: true });

      expect(beforeCreateStub.callCount).to.equal(0);
      expect(afterCreateStub.callCount).to.equal(0);
      expect(transformStub.callCount).to.equal(0);
      expect(decorateStub.callCount).to.equal(0);
      expect(calledBefore).to.equal(false);
      expect(calledAfter).to.equal(false);

      beforeCreateStub.restore();
      afterCreateStub.restore();
      transformStub.restore();
      decorateStub.restore();
    });
  });

  describe('#find()', function () {
    it('should find objects', async () => {
      const objects = await userService.createMany([
        { email: 'foo1', password: 'bar1', age: 12 },
        { email: 'foo2', password: 'bar2', age: 15 }
      ]);

      const userId1 = objects.getAt(0).id;
      const userId2 = objects.getAt(1).id;

      const assertContent = (list: Collection<TUser>, ids: number | number[]): void => {
        ids = Utils.makeArray(ids);
        expect(list.size()).to.equal(ids.length);
        for (const id of ids) {
          expect(list.find(object => object.id === id)).to.be.an('object', `Could not find id ${id} in list.`);
        }
      };

      const all = await userService.find({});
      const byEmail = await userService.find({ email: 'foo1' });
      const inEmail = await userService.find({ email: { in: ['foo1', 'foo2', 'foo3'] } });
      const notInEmail = await userService.find({ email: { nin: ['foo2', 'foo3'] } });
      const ageGreaterThan = await userService.find({ age: { gt: 12 } });
      const ageGreaterThanEqual = await userService.find({ age: { gte: 12 } });
      const ageLowerThan = await userService.find({ age: { lt: 15 } });
      const ageLowerThanEqual = await userService.find({ age: { lte: 15 } });

      assertContent(all, [userId1, userId2]);
      assertContent(byEmail, userId1);
      assertContent(inEmail, [userId1, userId2]);
      assertContent(notInEmail, userId1);
      assertContent(ageGreaterThan, userId2);
      assertContent(ageGreaterThanEqual, [userId2, userId1]);
      assertContent(ageLowerThan, userId1);
      assertContent(ageLowerThanEqual, [userId1, userId2]);
    });

    it('should return only selected fields (+ auto selected id)', async () => {
      await userService.create({ email: 'foo', password: 'bar' });
      const [ user ] = await userService.find({}, { select: ['email'] });
      expect(user).to.have.keys(['email', 'id']); // ID is auto selected
    });

    it('should sort returned objects', async () => {
      const [ user1, user2, user3 ] = await userService.createMany([
        { email: 'foo1', password: 'bar1', age: 12, lucky_number: 3 },
        { email: 'foo2', password: 'bar2', age: 15, lucky_number: 7 },
        { email: 'foo3', password: 'bar3', age: 15, lucky_number: 12 }
      ]);

      const assertContent = (list: Collection<TUser>, users: TUser | TUser[]): void => {
        users = Utils.makeArray(users);
        expect(users.length).to.equal(list.size());
        for (let i = 0, len = list.size(); i < len; i++) {
          expect(list.getAt(i).id).to.equal(users[i].id);
        }
      };

      const ageASC = await userService.find({}, { sort: [['age', SortOrder.ASC]] });
      const ageDESC = await userService.find({}, { sort: [['age', SortOrder.DESC]] });
      const passwordAndAge = await userService.find({}, { sort: [['age', SortOrder.ASC], ['lucky_number', SortOrder.DESC]] });

      assertContent(ageASC, [user1, user2, user3]);
      assertContent(ageDESC, [user2, user3, user1]);
      assertContent(passwordAndAge, [user1, user3, user2]);
    });

    it('should reuse transaction', async () => {
      let tx: Sequelize.Transaction = null;
      const afterCreateStub = Sinon.stub(userService, 'afterCreate' as any).callsFake((session: Session<any>) => {
        tx = <Sequelize.Transaction>session.getOptions().get('transaction')
      });
      await database.transaction(async transaction => {
        await userService.create({ email: 'foo', password: 'bar' }, { transaction });
        expect(tx).to.equal(transaction);
      });
      afterCreateStub.restore();
    });

    it('should decorate objects', async () => {
      await userService.createMany([
        { email: 'foo1', password: 'bar1', age: 12 },
        { email: 'foo2', password: 'bar2', age: 14 }
      ]);

      const [ user1, user2 ] = await userService.find({}, { decorate: ['date_of_birth'] });

      expect(user1.date_of_birth).to.be.a('date');
      expect(user2.date_of_birth).to.be.a('date');
    });

    it('should limit/offset returned objects', async () => {
      const [ user1, user2 ] = await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' }
      ]);

      const limit = await userService.find({}, { limit: 1 });
      const offset = await userService.find({}, { offset: 1 });

      expect(limit.size()).to.equal(1);
      expect(limit.getAt(0).id).to.equal(user1.id);

      expect(offset.size()).to.equal(1);
      expect(offset.getAt(0).id).to.equal(user2.id);
    });
  });

  describe('#findOne()', function () {
    it('should only find one object', async () => {
      const [ user1, ] = await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' }
      ]);

      const found = await userService.findOne({});
      expect(found).to.exist.and.containSubset({ id: user1.id });
    });
    it('should apply sorting', async () => {
      const [ , user2 ] = await userService.createMany([
        { email: 'foo1', password: 'bar1', age: 15 },
        { email: 'foo2', password: 'bar2', age: 12 }
      ]);

      const found = await userService.findOne({}, { sort: ['age'] });
      expect(found).to.exist.and.containSubset({ id: user2.id });
    });
    it('should only return selected fields', async () => {
      await userService.create({ email: 'foo', password: 'bar' });
      const found = await userService.findOne({}, { select: ['email'] });
      expect(found).to.contain.keys(['id', 'email']);
    });
    it('should decorate object', async () => {
      await userService.create({ email: 'foo', password: 'bar', age: 12 });
      const found = await userService.findOne({}, { decorate: ['date_of_birth'] });
      expect(found.date_of_birth).to.be.a('date');
    });
  });

  describe('#findByPrimaryKey()', function () {
    it('should find an object by primary key', async () => {
      const user = await userService.create({ email: 'foo', password: 'bar' });
      const found = await userService.findByPrimaryKey(user.id);
      expect(found).to.exist.and.containSubset({ id: user.id });
    });
    it('should only return selected fields', async () => {
      const user = await userService.create({ email: 'foo', password: 'bar' });
      const found = await userService.findByPrimaryKey(user.id, { select: ['email'] });
      expect(found).to.have.keys(['id', 'email']);
    });
    it('should decorate object', async () => {
      const user = await userService.create({ email: 'foo', password: 'bar', age: 12 });
      const found = await userService.findByPrimaryKey(user.id, { decorate: ['date_of_birth'] });
      expect(found.date_of_birth).to.be.a('date');
    });
  });

  describe('#findByPrimaryKeys()', function () {
    it('should find objects by primary keys', async () => {
      const users = await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' }
      ]);

      const found = await userService.findByPrimaryKeys(users.mapByProperty('id'));
      expect(found.size()).to.equal(2);
    });
    it('should only return selected fields', async () => {
      const users = await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' }
      ]);

      const found = await userService.findByPrimaryKeys(users.mapByProperty('id'), { select: ['email'] });
      found.forEach(object => expect(object).to.have.keys(['id', 'email']));
    });
    it('should decorate objects', async () => {
      const users = await userService.createMany([
        { email: 'foo1', password: 'bar1', age: 12 },
        { email: 'foo2', password: 'bar2', age: 12 }
      ]);

      const found = await userService.findByPrimaryKeys(users.mapByProperty('id'), { decorate: ['date_of_birth'] });
      found.forEach(object => expect(object.date_of_birth).to.be.a('date'));
    });
  });

  describe('#update()', function () {
    it('should update objects', async () => {
      const users = await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' }
      ]);
      const count = await userService.update({ id: { in: users.mapByProperty('id') } }, { age: 12 });
      expect(count).to.equal(2);
      const retrieved = await userService.find({});
      expect(retrieved.size()).to.equal(2);
      retrieved.forEach(object => expect(object.age).to.equal(12));
    });
    it('should call hooks', async () => {
      let calledBefore = false;
      let calledAfter = false;
      const beforeUpdateStub = Sinon.stub(userService, 'beforeUpdate' as any);
      const afterUpdateStub = Sinon.stub(userService, 'afterUpdate' as any);
      const transformStub = Sinon.stub(userService, 'transform' as any);
      userService.subscribe(Hook.WILL_UPDATE, () => calledBefore = true);
      userService.subscribe(Hook.DID_UPDATE, () => calledAfter = true);

      await userService.update({}, { email: 'foo', password: 'bar' });

      expect(beforeUpdateStub.calledOnce).to.equal(true);
      expect(afterUpdateStub.calledOnce).to.equal(true);
      expect(transformStub.calledOnce).to.equal(true);
      expect(calledBefore).to.equal(true);
      expect(calledAfter).to.equal(true);

      beforeUpdateStub.restore();
      afterUpdateStub.restore();
      transformStub.restore();
    });
  });

  after(async () => {
    await database.close();
  });
});