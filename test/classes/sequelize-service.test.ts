import { ICollection } from '@bluejay/collection';
import { RestError } from '@bluejay/rest-errors';
import * as Utils from '@bluejay/utils';
import { pick } from '@bluejay/utils';
import { expect } from 'chai';
import * as Sequelize from 'sequelize';
import * as Sinon from 'sinon';

import { SequelizeService } from '../../src';
import { Session } from '../../src/classes/session';
import { Hook } from '../../src/constants/hook';
import { SortOrder } from '../../src/constants/sort-order';
import { IUpdateSession } from '../../src/interfaces/update-session';

import { database, userService } from '../resources';
import { UserComputedPropertiesManager } from '../resources/services/user/computed-properties';
import { UserAge } from '../resources/services/user/computed-properties/age';
import { TUserComputedProperties, TUserReadProperties, TUserWriteProperties } from '../resources/types/user';
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
      } catch (err) {
        expect((err as RestError).statusCode).to.equal(409);
        return;
      }
      throw new Error(`Should not pass here`);
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

      const assertContent = (list: ICollection<TUserReadProperties>, ids: number | number[]): void => {
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
      const [user] = await userService.find({}, { select: ['email'] });
      expect(user).to.have.keys(['email', 'id']); // ID is auto selected
    });

    it('should only resolve types for what was selected (+ auto selected id)', async () => {
      await userService.create({ email: 'foo', password: 'bar' });
      const [user] = await userService.find({}, { select: ['email'] });
      expect(user).to.have.keys(['email', 'id']); // ID is auto selected
      expect(user).to.not.have.keys(['first_name']);
      // user.first_name; // Note: Should NOT compile!
    });

    it('should by default select everything', async () => {
      await userService.create({ email: 'foo', password: 'bar' });
      const [user] = await userService.find({});
      expect(user).to.have.keys(['id', 'email', 'first_name', 'last_name', 'date_of_birth', 'lucky_number', 'password', 'password_last_updated_at', 'updated_at', 'created_at']);
    });

    it('should only resolve types for what was computed (+ auto selected id)', async () => {
      await userService.create({ email: 'foo', password: 'bar' });
      const [user] = await userService.find({ id: { gte: 0 } }, { select: [], compute: ['age'] });
      expect(user).to.have.keys(['id', 'date_of_birth', 'age']); // 'id' is auto selected and 'date_of_birth' is a dependency of 'age'
      expect(user).to.not.have.keys(['isAdult']);
      // user.date_of_birth; // Note: Should NOT compile!
      // user.isAdult; // Note: Should NOT compile!
    });

    it('should not auto compute anything', async () => {
      await userService.create({ email: 'foo', password: 'bar' });
      const [user] = await userService.find({}, { select: [] });
      expect(user).to.have.keys(['id']);
      expect(user).to.not.have.keys(['isAdult']);
      // user.age; // Note: Should NOT compile!
      // user.isAdult; // Note: Should NOT compile!
    });

    it('should sort returned objects', async () => {
      const [user1, user2, user3] = await userService.createMany([
        { email: 'foo1', password: 'bar1', date_of_birth: ageToDOB(12), lucky_number: 3 },
        { email: 'foo2', password: 'bar2', date_of_birth: ageToDOB(15), lucky_number: 7 },
        { email: 'foo3', password: 'bar3', date_of_birth: ageToDOB(15), lucky_number: 12 }
      ]);

      const assertContent = (list: ICollection<TUserReadProperties>, users: TUserReadProperties | TUserReadProperties[]): void => {
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
      let tx: Sequelize.Transaction | null = null;
      const afterCreateStub = Sinon.stub(userService, 'afterCreate' as any).callsFake((session: Session<any, any, any, any>) => {
        tx = <Sequelize.Transaction>session.getOptions().get('transaction');
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

      const [user1, user2] = await userService.find({}, { compute: ['age', 'isAdult'] });

      expect(user1).to.containSubset({ age: 12, isAdult: false });
      expect(user2).to.containSubset({ age: 23, isAdult: true });
    });

    it('should compute properties only once', async () => {
      await userService.createMany([
        { email: 'foo1', password: 'bar1', date_of_birth: ageToDOB(12) },
        { email: 'foo2', password: 'bar2', date_of_birth: ageToDOB(23) }
      ]);

      const userComputedPropertiesManagerTransformSpy = Sinon.spy(UserComputedPropertiesManager.prototype, 'transform');
      const userAgeComputerPropertyTransformSpy = Sinon.spy(UserAge.prototype, 'transform');

      const [user1, user2] = await userService.find({}, { compute: ['age', 'isAdult'] });

      expect(userComputedPropertiesManagerTransformSpy.callCount).to.equal(1);
      expect(userAgeComputerPropertyTransformSpy.callCount).to.equal(1);

      expect(user1).to.containSubset({ age: 12, isAdult: false });
      expect(user2).to.containSubset({ age: 23, isAdult: true });
    });

    it('should throw trying to compute unknown property', async () => {
      await userService.createMany([
        { email: 'foo1', password: 'bar1', date_of_birth: ageToDOB(12) },
        { email: 'foo2', password: 'bar2', date_of_birth: ageToDOB(23) }
      ]);

      try {
        await userService.find({}, { compute: ['toto' as any] });
      } catch (err) {
        expect(err.message).to.match(/toto/);
        return;
      }
      throw new Error(`Should not pass here`);
    });

    it('should limit/offset returned objects', async () => {
      const [user1, user2] = await userService.createMany([
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
      const [user1] = await userService.createMany([
        { email: 'foo1', password: 'bar1' },
        { email: 'foo2', password: 'bar2' }
      ]);

      const found = await userService.findOne({});
      expect(found).to.exist.and.containSubset({ id: user1.id });
    });
    it('should apply sorting', async () => {
      const [, user2] = await userService.createMany([
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
      expect(found).to.have.property('age', 12);
    });
    it('should return null if no object is found', async () => {
      const found = await userService.findOne({});
      expect(found).to.equal(null);
    });
    it('should not modify the options in a side effect', async () => {
      const options = {};
      await userService.findOne({}, options);
      expect(options).to.eql({});
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
      expect(found).to.have.property('age', 12);
    });
    it('should return null if no object is found', async () => {
      const found = await userService.findByPrimaryKey(1);
      expect(found).to.equal(null);
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
    it('should keep modified values from session', async () => {
      const user = await userService.create({ email: 'foo1', password: 'bar1' });
      const beforeUpdateStub = Sinon.stub(userService, 'beforeUpdate' as any).callsFake(async (session: IUpdateSession<TUserWriteProperties, TUserReadProperties, TUserComputedProperties>) => {
        session.setValue('last_name', 'Doe');
      });
      await userService.update({ id: user.id }, { date_of_birth: ageToDOB(12) });
      const retrieved = <TUserReadProperties>await userService.findByPrimaryKey(user.id);
      expect(retrieved.last_name).to.equal('Doe');
      beforeUpdateStub.restore();
    });
    it('should keep context', async () => {
      const user = await userService.create({ email: 'foo1', password: 'bar1' });
      const beforeUpdateStub = Sinon.stub(userService, 'beforeUpdate' as any).callsFake(async (session: IUpdateSession<TUserWriteProperties, TUserReadProperties, TUserComputedProperties>) => {
        session.getContext().set('foo', 'bar');
      });
      const afterUpdateStub = Sinon.stub(userService, 'afterUpdate' as any).callsFake(async (session: IUpdateSession<TUserWriteProperties, TUserReadProperties, TUserComputedProperties>) => {
        expect(session.getContext().get('foo')).to.equal('bar');
      });

      await userService.update({ id: user.id }, { date_of_birth: ageToDOB(12) });

      beforeUpdateStub.restore();
      afterUpdateStub.restore();
    });
  });

  describe('#updateByPrimaryKey()', function () {
    it('should update object', async () => {
      const [user1, user2] = await userService.createMany([
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
      expect((await userService.findOne({}))).to.have.property('password', 'baz');
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

  describe('#upsert()', function () {
    it('should create object', async () => {
      const properties = { email: 'foo', password: 'bar' };
      expect(await userService.count({})).to.equal(0);
      const user = await userService.upsert(properties);
      expect(await userService.count({})).to.equal(1);
      expect(user).to.containSubset(properties);
    });
    it('should create object and compute properties', async () => {
      const user = await userService.upsert({ email: 'foo', password: 'bar' }, { compute: ['age'] });
      expect(user).to.include.keys(['id', 'email', 'password', 'age']);
    });
    it('should update object', async () => {
      const createProperties = { email: 'foo', password: 'bar', first_name: 'alice' };
      const upsertProperties = { email: 'foo', password: 'baz', first_name: 'bob' };

      expect(await userService.count({})).to.equal(0);
      await userService.create(createProperties);
      expect(await userService.count({})).to.equal(1);
      const user = await userService.upsert(upsertProperties);
      expect(await userService.count({})).to.equal(1);
      expect(user).to.containSubset({ ...createProperties, ...upsertProperties });
    });
    it('should update object (with fields)', async () => {
      const createProperties = { email: 'foo', password: 'bar', first_name: 'alice' };
      const upsertProperties = { email: 'foo', password: 'baz', first_name: 'bob' };
      expect(await userService.count({})).to.equal(0);
      await userService.create(createProperties);
      expect(await userService.count({})).to.equal(1);
      const user = await userService.upsert(upsertProperties, { fields: ['password'] });
      expect(await userService.count({})).to.equal(1);
      expect(user).to.containSubset({ ...createProperties, ...pick(upsertProperties, 'password') }); // Only password was updated!
    });
    it('should call upsert hooks', async () => {
      let calledBefore = false;
      let calledAfter = false;
      const beforeUpsertStub = Sinon.stub(userService, 'beforeUpsert' as any);
      const afterUpsertStub = Sinon.stub(userService, 'afterUpsert' as any);
      userService.subscribe(Hook.DID_UPSERT, () => calledBefore = true);
      userService.subscribe(Hook.WILL_UPSERT, () => calledAfter = true);

      await userService.upsert({ email: 'foo', password: 'bar' });

      expect(beforeUpsertStub.calledOnce).to.equal(true);
      expect(afterUpsertStub.calledOnce).to.equal(true);
      expect(calledBefore).to.equal(true);
      expect(calledAfter).to.equal(true);

      beforeUpsertStub.restore();
      afterUpsertStub.restore();
    });
  });
});
