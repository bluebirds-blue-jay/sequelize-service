import { database, userService } from '../resources';
import * as Sinon from 'sinon';
import { Hook } from '../../src/constants/hook';
import { RestError } from '@bluejay/rest-errors';
import { SequelizeService } from '../..';
import * as Utils from '@bluejay/utils';
import { Collection } from '@bluejay/collection';
import * as Sequelize from 'sequelize';
import { Session } from '../../src/classes/session';
import { SortOrder } from '../../src/constants/sort-order';
import { TUserReadProperties } from '../resources/types/user';
import moment = require('moment');

const dobCache: { [age: number]: Date } = {};
function ageToDOB(age: number): Date {
  if (dobCache[age]) {
    return dobCache[age];
  }
  const value = moment().subtract(age, 'years').toDate();
  dobCache[age] = value;
  return value;
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
      const computePropertiesStub = Sinon.stub(userService, 'computeProperties' as any);
      userService.subscribe(Hook.DID_CREATE, () => calledBefore = true);
      userService.subscribe(Hook.WILL_CREATE, () => calledAfter = true);

      await userService.create({ email: 'foo', password: 'bar' });

      expect(beforeCreateStub.calledOnce).to.equal(true);
      expect(afterCreateStub.calledOnce).to.equal(true);
      expect(computePropertiesStub.calledOnce).to.equal(true);
      expect(calledBefore).to.equal(true);
      expect(calledAfter).to.equal(true);

      beforeCreateStub.restore();
      afterCreateStub.restore();
      computePropertiesStub.restore();
    });
    it('should skip hooks', async () => {
      let calledBefore = false;
      let calledAfter = false;
      const beforeCreateStub = Sinon.stub(userService, 'beforeCreate' as any);
      const afterCreateStub = Sinon.stub(userService, 'afterCreate' as any);
      const computePropertiesStub = Sinon.stub(userService, 'computeProperties' as any);
      userService.subscribe(Hook.DID_CREATE, () => calledBefore = true);
      userService.subscribe(Hook.WILL_CREATE, () => calledAfter = true);

      await userService.create({ email: 'foo', password: 'bar' }, { skipHooks: true });

      expect(beforeCreateStub.callCount).to.equal(0);
      expect(afterCreateStub.callCount).to.equal(0);
      expect(computePropertiesStub.callCount).to.equal(1);
      expect(calledBefore).to.equal(false);
      expect(calledAfter).to.equal(false);

      beforeCreateStub.restore();
      afterCreateStub.restore();
      computePropertiesStub.restore();
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
      const computePropertiesStub = Sinon.stub(userService, 'computeProperties' as any);
      userService.subscribe(Hook.DID_CREATE, () => calledBefore = true);
      userService.subscribe(Hook.WILL_CREATE, () => calledAfter = true);

      await userService.createMany([{ email: 'foo', password: 'bar' }]);

      expect(beforeCreateStub.calledOnce).to.equal(true);
      expect(afterCreateStub.calledOnce).to.equal(true);
      expect(computePropertiesStub.calledOnce).to.equal(true);
      expect(calledBefore).to.equal(true);
      expect(calledAfter).to.equal(true);

      beforeCreateStub.restore();
      afterCreateStub.restore();
      computePropertiesStub.restore();
    });
    it('should skip hooks', async () => {
      let calledBefore = false;
      let calledAfter = false;
      const beforeCreateStub = Sinon.stub(userService, 'beforeCreate' as any);
      const afterCreateStub = Sinon.stub(userService, 'afterCreate' as any);
      const computePropertiesStub = Sinon.stub(userService, 'computeProperties' as any);
      userService.subscribe(Hook.DID_CREATE, () => calledBefore = true);
      userService.subscribe(Hook.WILL_CREATE, () => calledAfter = true);

      await userService.createMany([{ email: 'foo', password: 'bar' }], { skipHooks: true });

      expect(beforeCreateStub.callCount).to.equal(0);
      expect(afterCreateStub.callCount).to.equal(0);
      expect(computePropertiesStub.callCount).to.equal(1);
      expect(calledBefore).to.equal(false);
      expect(calledAfter).to.equal(false);

      beforeCreateStub.restore();
      afterCreateStub.restore();
      computePropertiesStub.restore();
    });
  });

  describe('#find()', function () {
    it('should find objects', async () => {
      const objects = await userService.createMany([
        { email: 'foo1', password: 'bar1', date_of_birth: ageToDOB(12) },
        { email: 'foo2', password: 'bar2', date_of_birth: ageToDOB(15) }
      ]);

      const userId1 = objects.getAt(0).id;
      const userId2 = objects.getAt(1).id;

      const assertContent = (list: Collection<TUserReadProperties>, ids: number | number[]): void => {
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
      const dateOfBirthLowerThan = await userService.find({ date_of_birth: { lt: ageToDOB(12) } });
      const dateOfBirthLowerThanEqual = await userService.find({ date_of_birth: { lte: ageToDOB(12) } });
      const dateOfBirthGreaterThan = await userService.find({ date_of_birth: { gt: ageToDOB(15) } });
      const dateOfBirthGreaterThanEqual = await userService.find({ date_of_birth: { gte: ageToDOB(15) } });

      assertContent(all, [userId1, userId2]);
      assertContent(byEmail, userId1);
      assertContent(inEmail, [userId1, userId2]);
      assertContent(notInEmail, userId1);
      assertContent(dateOfBirthLowerThan, userId2);
      assertContent(dateOfBirthLowerThanEqual, [userId2, userId1]);
      assertContent(dateOfBirthGreaterThan, userId1);
      assertContent(dateOfBirthGreaterThanEqual, [userId1, userId2]);
    });

    it('should return only selected fields (+ auto selected id)', async () => {
      await userService.create({ email: 'foo', password: 'bar' });
      const [ user ] = await userService.find({}, { select: ['email'] });
      expect(user).to.have.keys(['email', 'id']); // ID is auto selected
    });

    it('should only resolve types for what was selected (+ auto selected id)', async () => {
      await userService.create({ email: 'foo', password: 'bar' });
      const [ user ] = await userService.find({}, { select: ['email'] });
      expect(user).to.have.keys(['email', 'id']); // ID is auto selected
      expect(user).to.not.have.keys(['first_name']);
      // user.first_name; // Note: Should NOT compile!
    });

    it('should by default select everything', async () => {
      await userService.create({ email: 'foo', password: 'bar' });
      const [ user ] = await userService.find({});
      expect(user).to.have.keys(['id', 'email', 'first_name', 'last_name', 'date_of_birth', 'lucky_number', 'password', 'password_last_updated_at', 'updated_at', 'created_at']);
    });

    it('should only resolve types for what was computed (+ auto selected id)', async () => {
      await userService.create({ email: 'foo', password: 'bar' });
      const [ user ] = await userService.find({}, { select: [], compute: ['age'] });
      expect(user).to.have.keys(['id', 'date_of_birth', 'age']); // 'id' is auto selected and 'date_of_birth' is a dependency of 'age'
      expect(user).to.not.have.keys(['isAdult']);
      // user.date_of_birth; // Note: Should NOT compile!
      // user.isAdult; // Note: Should NOT compile!
    });

    it('should not auto compute anything', async () => {
      await userService.create({ email: 'foo', password: 'bar' });
      const [ user ] = await userService.find({}, { select: [] });
      expect(user).to.have.keys(['id']);
      expect(user).to.not.have.keys(['isAdult']);
      // user.age; // Note: Should NOT compile!
      // user.isAdult; // Note: Should NOT compile!
    });

    it('should sort returned objects', async () => {
      const [ user1, user2, user3 ] = await userService.createMany([
        { email: 'foo1', password: 'bar1', date_of_birth: ageToDOB(12), lucky_number: 3 },
        { email: 'foo2', password: 'bar2', date_of_birth: ageToDOB(15), lucky_number: 7 },
        { email: 'foo3', password: 'bar3', date_of_birth: ageToDOB(15), lucky_number: 12 }
      ]);

      const assertContent = (list: Collection<TUserReadProperties>, users: TUserReadProperties | TUserReadProperties[]): void => {
        users = Utils.makeArray(users);
        expect(users.length).to.equal(list.size());
        for (let i = 0, len = list.size(); i < len; i++) {
          expect(list.getAt(i).id).to.equal(users[i].id);
        }
      };

      const ageASC = await userService.find({}, { sort: [['date_of_birth', SortOrder.DESC]] });
      const ageDESC = await userService.find({}, { sort: [['date_of_birth', SortOrder.ASC]] });
      const passwordAndAge = await userService.find({}, { sort: [['date_of_birth', SortOrder.DESC], ['lucky_number', SortOrder.DESC]] });

      assertContent(ageASC, [user1, user2, user3]);
      assertContent(ageDESC, [user2, user3, user1]);
      assertContent(passwordAndAge, [user1, user3, user2]);
    });

    it('should reuse transaction', async () => {
      let tx: Sequelize.Transaction = null;
      const afterCreateStub = Sinon.stub(userService, 'afterCreate' as any).callsFake((session: Session<any, any, any>) => {
        tx = <Sequelize.Transaction>session.getOptions().get('transaction')
      });
      await database.transaction(async transaction => {
        await userService.create({ email: 'foo', password: 'bar' }, { transaction });
        expect(tx).to.equal(transaction);
      });
      afterCreateStub.restore();
    });

    it('should compute properties', async () => {
      await userService.createMany([
        { email: 'foo1', password: 'bar1', date_of_birth: ageToDOB(12) },
        { email: 'foo2', password: 'bar2', date_of_birth: ageToDOB(23) }
      ]);

      const [ user1, user2 ] = await userService.find({}, { compute: ['age', 'isAdult'] });

      expect(user1).to.containSubset({ age: 12, isAdult: false });
      expect(user2).to.containSubset({ age: 23, isAdult: true });
    });

    it('should throw trying to compute unknown property', async () => {
      await userService.createMany([
        { email: 'foo1', password: 'bar1', date_of_birth: ageToDOB(12) },
        { email: 'foo2', password: 'bar2', date_of_birth: ageToDOB(23) }
      ]);

      try {
        await userService.find({}, { compute: ['toto' as any] })
      } catch(err) {
        expect(err.message).to.match(/toto/);
        return;
      }
      throw new Error(`Should not pass here`);
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
        { email: 'foo1', password: 'bar1', date_of_birth: ageToDOB(15) },
        { email: 'foo2', password: 'bar2', date_of_birth: ageToDOB(12) }
      ]);

      const found = await userService.findOne({}, { sort: [['date_of_birth', SortOrder.DESC]] });
      expect(found).to.exist.and.containSubset({ id: user2.id });
    });
    it('should only return selected fields', async () => {
      await userService.create({ email: 'foo', password: 'bar' });
      const found = await userService.findOne({}, { select: ['email'] });
      expect(found).to.contain.keys(['id', 'email']);
    });
    it('should compute properties object', async () => {
      await userService.create({ email: 'foo', password: 'bar', date_of_birth: ageToDOB(12) });
      const found = await userService.findOne({}, { compute: ['age'] });
      expect(found.age).to.equal(12);
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
    it('should computeProperties object', async () => {
      const user = await userService.create({ email: 'foo', password: 'bar', date_of_birth: ageToDOB(12) });
      const found = await userService.findByPrimaryKey(user.id, { compute: ['age'] });
      expect(found.age).to.equal(12);
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
    it('should computeProperties objects', async () => {
      const users = await userService.createMany([
        { email: 'foo1', password: 'bar1', date_of_birth: ageToDOB(12) },
        { email: 'foo2', password: 'bar2', date_of_birth: ageToDOB(12) }
      ]);

      const found = await userService.findByPrimaryKeys(users.mapByProperty('id'), { compute: ['age'] });
      found.forEach(object => expect(object.age).to.equal(12));
    });
  });

  describe('#update()', function () {
    it('should update objects', async () => {
      const users = await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' }
      ]);
      const count = await userService.update({ id: { in: users.mapByProperty('id') } }, { date_of_birth: ageToDOB(12) });
      expect(count).to.equal(2);
      const retrieved = await userService.find({}, { compute: ['age'] });
      expect(retrieved.size()).to.equal(2);
      retrieved.forEach(object => expect(object.age).to.equal(12));
    });
    it('should limit updated objects', async () => {
      const users = await userService.createMany([
        { email: 'foo1', password: 'bar1', date_of_birth: ageToDOB(15) },
        { email: 'foo2', password: 'bar2', date_of_birth: ageToDOB(15) }
      ]);
      const count = await userService.update({ id: { in: users.mapByProperty('id') } }, { date_of_birth: ageToDOB(12) }, {
        limit: 1
      });
      expect(count).to.equal(1);
      const retrieved = await userService.find({}, { compute: ['age'] });
      expect(retrieved.size()).to.equal(2);
      expect(retrieved.getAt(0).age).to.equal(12);
      expect(retrieved.getAt(1).age).to.equal(15);
    });
    it('should call hooks', async () => {
      let calledBefore = false;
      let calledAfter = false;
      const beforeUpdateStub = Sinon.stub(userService, 'beforeUpdate' as any);
      const afterUpdateStub = Sinon.stub(userService, 'afterUpdate' as any);
      userService.subscribe(Hook.WILL_UPDATE, () => calledBefore = true);
      userService.subscribe(Hook.DID_UPDATE, () => calledAfter = true);

      await userService.update({}, { email: 'foo', password: 'bar' });

      expect(beforeUpdateStub.calledOnce).to.equal(true);
      expect(afterUpdateStub.calledOnce).to.equal(true);
      expect(calledBefore).to.equal(true);
      expect(calledAfter).to.equal(true);

      beforeUpdateStub.restore();
      afterUpdateStub.restore();
    });
  });

  describe('#updateByPrimaryKey()', function () {
    it('should update object', async () => {
      const [ user1, user2 ] = await userService.createMany([
        { email: 'foo1', password: 'bar1', date_of_birth: ageToDOB(15) },
        { email: 'foo2', password: 'bar2', date_of_birth: ageToDOB(15) }
      ]);
      const count = await userService.updateByPrimaryKey(user1.id, { date_of_birth: ageToDOB(12) });
      const retrieved = await userService.findByPrimaryKeys([user1.id, user2.id], { compute: ['age'] });
      expect(count).to.equal(1);
      expect(retrieved.size()).to.equal(2);
      expect(retrieved.getAt(0).age).to.equal(12);
      expect(retrieved.getAt(1).age).to.equal(15);
    });
    it('should call hooks', async () => {
      let calledBefore = false;
      let calledAfter = false;
      const beforeUpdateStub = Sinon.stub(userService, 'beforeUpdate' as any);
      const afterUpdateStub = Sinon.stub(userService, 'afterUpdate' as any);
      userService.subscribe(Hook.WILL_UPDATE, () => calledBefore = true);
      userService.subscribe(Hook.DID_UPDATE, () => calledAfter = true);

      await userService.updateByPrimaryKey(1, { email: 'foo', password: 'bar' });

      expect(beforeUpdateStub.calledOnce).to.equal(true);
      expect(afterUpdateStub.calledOnce).to.equal(true);
      expect(calledBefore).to.equal(true);
      expect(calledAfter).to.equal(true);

      beforeUpdateStub.restore();
      afterUpdateStub.restore();
    });
  });

  describe('#delete()', function () {
    it('should delete object', async () => {
      const users = await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' }
      ]);
      const count = await userService.delete({ id: { in: users.mapByProperty('id') } });
      expect(count).to.equal(2);
      const retrieved = await userService.find({});
      expect(retrieved.size()).to.equal(0);
    });
    it('should limit deleted objects', async () => {
      const users = await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' }
      ]);
      const count = await userService.delete({ id: { in: users.mapByProperty('id') } }, { limit: 1 });
      expect(count).to.equal(1);
      const retrieved = await userService.find({});
      expect(retrieved.size()).to.equal(1);
    });
    it('should call hooks', async () => {
      let calledBefore = false;
      let calledAfter = false;
      const beforeDeleteStub = Sinon.stub(userService, 'beforeDelete' as any);
      const afterDeleteStub = Sinon.stub(userService, 'afterDelete' as any);
      userService.subscribe(Hook.WILL_DELETE, () => calledBefore = true);
      userService.subscribe(Hook.DID_DELETE, () => calledAfter = true);

      await userService.delete({});

      expect(beforeDeleteStub.calledOnce).to.equal(true);
      expect(afterDeleteStub.calledOnce).to.equal(true);
      expect(calledBefore).to.equal(true);
      expect(calledAfter).to.equal(true);

      beforeDeleteStub.restore();
      afterDeleteStub.restore();
    });
  });

  describe('#count()', function () {
    it('should count objects', async () => {
      await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' }
      ]);
      const count = await userService.count({});
      expect(count).to.equal(2);
    });
    it('should count filtered objects', async () => {
      await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' }
      ]);
      const count = await userService.count({ email: 'foo1' });
      expect(count).to.equal(1);
    });
  });

  describe('#replaceOne()', function () {
    it('should create object', async () => {
      expect(await userService.count({})).to.equal(0);
      await userService.replaceOne({ email: 'foo' }, { email: 'foo', password: 'bar' });
      expect(await userService.count({})).to.equal(1);
    });
    it('should update object', async () => {
      await userService.create({ email: 'foo', password: 'bar' });
      expect(await userService.count({})).to.equal(1);
      await userService.replaceOne({ email: 'foo' }, { email: 'foo', password: 'baz' });
      expect(await userService.count({})).to.equal(1);
      expect((await userService.findOne({})).password).to.equal('baz');
    });
    it('should call create hooks', async () => {
      let calledBefore = false;
      let calledAfter = false;
      const beforeCreateStub = Sinon.stub(userService, 'beforeCreate' as any);
      const afterCreateStub = Sinon.stub(userService, 'afterCreate' as any);
      const computePropertiesStub = Sinon.stub(userService, 'computeProperties' as any);
      userService.subscribe(Hook.DID_CREATE, () => calledBefore = true);
      userService.subscribe(Hook.WILL_CREATE, () => calledAfter = true);

      await userService.replaceOne({ email: 'foo' }, { email: 'foo', password: 'bar' });

      expect(beforeCreateStub.calledOnce).to.equal(true);
      expect(afterCreateStub.calledOnce).to.equal(true);
      expect(computePropertiesStub.calledOnce).to.equal(true);
      expect(calledBefore).to.equal(true);
      expect(calledAfter).to.equal(true);

      beforeCreateStub.restore();
      afterCreateStub.restore();
      computePropertiesStub.restore();
    });
    it('should call update hooks', async () => {
      await userService.create({ email: 'foo', password: 'bar' });

      let calledBefore = false;
      let calledAfter = false;
      const beforeUpdateStub = Sinon.stub(userService, 'beforeUpdate' as any);
      const afterUpdateStub = Sinon.stub(userService, 'afterUpdate' as any);
      userService.subscribe(Hook.WILL_UPDATE, () => calledBefore = true);
      userService.subscribe(Hook.DID_UPDATE, () => calledAfter = true);

      await userService.replaceOne({ email: 'foo' }, { email: 'foo', password: 'baz' });

      expect(beforeUpdateStub.calledOnce).to.equal(true);
      expect(afterUpdateStub.calledOnce).to.equal(true);
      expect(calledBefore).to.equal(true);
      expect(calledAfter).to.equal(true);

      beforeUpdateStub.restore();
      afterUpdateStub.restore();
    });
  });
});