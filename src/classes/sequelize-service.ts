import { Service } from '@bluejay/service';
import { ISequelizeService } from '../interfaces/sequelize-service';
import * as Sequelize from 'sequelize';
import { injectable } from 'inversify';
import { TTransactionOptions } from '../types/transaction-options';
import { TCreateOptions } from '../types/create-options';
import { BadRequestRestError, ConflictRestError } from '@bluejay/rest-errors';
import { CreateSession } from './sessions/create-session';
import { TFilters } from '../types/filters';
import { TFindOptions } from '../types/find-options';
import { Hook } from '../constants/hook';
import { Session } from './sessions/session';
import * as Lodash from 'lodash';
import { Collection } from '@bluejay/collection';
import { TAllOptions } from '../types/all-options';
import { TAllSequelizeOptions } from '../types/all-sequelize-options';
import { TSequelizeAttributesOption } from '../types/sequelize-attributes-option';
import { TSequelizeOrderOption } from '../types/sequelize-order-option';
import { TSequelizeOperatorFilter } from '../types/sequelize-operator-filter';
import { TOperatorFilter } from '../types/operator-filter';
import { TSequelizeWhere } from '../types/sequelize-where';
import { TSequelizeFindOptions } from '../types/sequelize-find-options';
import { TFindOneOptions } from '../types/find-one-options';
import { TFindByPrimaryKeyOptions } from '../types/find-by-primary-key-options';
import { SortOrder } from '../constants/sort-order';
import { TValues } from '../types/values';
import { TUpdateOptions } from '../types/update-options';
import { UpdateSession } from './sessions/update-session';
import { TSequelizeUpdateOptions } from '../types/sequelize-update-options';
import { AnyWhereOptions } from 'sequelize';

@injectable()
export class SequelizeService<A, PK extends A[keyof A]> extends Service implements ISequelizeService<A, PK> {
  private primaryKeyField: keyof A = 'id' as keyof A;

  public constructor(protected model: Sequelize.Model<A, A>) {
    super();
  }

  public getPrimaryKeyField() {
    return this.primaryKeyField;
  }

  public async create(object: A, options: TCreateOptions<A> = {}): Promise<A> {
    return await SequelizeService.try(async () => {
      return await this.transaction(options, async () => {
        const session = new CreateSession<A>([object], options, this);

        await this.executeHook(Hook.WILL_CREATE, session, this._beforeCreate.bind(this));

        const created = <A>(<any>await this.model.create(object, options)).toJSON();

        session.setObjects([created]);

        await this.executeHook(Hook.DID_CREATE, session, this._afterCreate.bind(this));

        return created;
      });
    });
  }

  public async createMany(objects: A[], options: TCreateOptions<A> = {}): Promise<Collection<A>> {
    return await SequelizeService.try(async () => {
      return await this.transaction(options, async () => {
        const session = new CreateSession<A>(objects, options, this);

        await this.executeHook(Hook.WILL_CREATE, session, this._beforeCreate.bind(this));

        const created = (await Promise.all(objects.map(async item => {
          return await this.model.create(item, options);
        }))).map(object => {
          return (<any>object).toJSON();
        });

        session.setObjects(created);

        await this.executeHook(Hook.DID_CREATE, session, this._afterCreate.bind(this));

        return new Collection(created);
      });
    });
  }

  public async find(filters: TFilters<A>, options: TFindOptions<A> = {}): Promise<Collection<A>> {
    const formattedFilters = this.toSequelizeWhere(filters);
    const sequelizeOptions = this.toSequelizeOptions<TSequelizeFindOptions<A>>(options, { where: formattedFilters });

    const objects = (await this.model.findAll(sequelizeOptions)).map(object => (<any>object).toJSON());

    if (objects.length) {
      await this.decorate(new Session<A, TFindOptions<A>>(objects, options, this, filters));
    }

    return new Collection(objects);
  }

  public async findOne(filters: TFilters<A>, options: TFindOneOptions<A> = {}): Promise<A> {
    const [ object ] = await this.find(filters, Object.assign(options, { limit: 1 }));
    return object || null;
  }

  public async findByPrimaryKey(pk: PK, options: TFindByPrimaryKeyOptions<A> = {}): Promise<A> {
    return await this.findOne({ [this.getPrimaryKeyField()]: pk } as any, options);
  }

  public async findByPrimaryKeys(pks: PK[], options: TFindByPrimaryKeyOptions<A> = {}): Promise<Collection<A>> {
    return await this.find({ [this.getPrimaryKeyField()]: { in: pks } } as any, options);
  }

  public async update(filters: TFilters<A>, values: TValues<A>, options: TUpdateOptions<A> = {}): Promise<number> {
    return await this.transaction(options, async () => {
      const session = new UpdateSession<A>(filters, values, options, this);
      await this._beforeUpdate(session);
      const formattedFilters = this.toSequelizeWhere(filters);
      const sequelizeOptions = this.toSequelizeOptions<any>(options, { where: formattedFilters });
      const [ count ] = await this.model.update(values, sequelizeOptions);
      await this._afterUpdate(session);
      return count;
    });
  }

  protected async beforeUpdate(session: UpdateSession<A>) {}
  protected async afterUpdate(session: UpdateSession<A>) {}
  protected async beforeCreate(session: CreateSession<A>) {}
  protected async afterCreate(session: CreateSession<A>) {}
  protected async transform(session: Session<A>) {}
  protected async decorate(session: Session<A>) {}

  protected async executeHook(hook: Hook, session: Session<A>, handler: (session: Session<A>) => Promise<any>) {
    if (session.getOptions().get('skipHooks')) {
      return;
    }

    await handler(session);
  }

  protected async transaction<T>(
    options: TTransactionOptions,
    callback: (transaction: Sequelize.Transaction) => Promise<T>
  ): Promise<T> {
    if (options.transaction) {
      return await callback(options.transaction);
    }

    return await (<any>this.model).sequelize.transaction(options, async (transaction: Sequelize.Transaction) => {
      options.transaction = transaction;
      return await callback(transaction);
    });
  }

  protected toSequelizeWhere(filters: TFilters<A>): TSequelizeWhere<A> {
    for (const propertyName of Object.getOwnPropertyNames(filters)) {
      const filter = <TOperatorFilter<A> & TSequelizeOperatorFilter<A>>filters[propertyName as keyof A];

      if (Lodash.isPlainObject(filter)) {
        if (filter.nin) {
          this.warn(!(<any>filter.nin).length, `Empty NIN clause, query should be avoided`, { [propertyName]: filter });
          filter.notIn = <any>filter.nin;
          delete filter.nin;
        }

        this.warn(filter.in && !(<any[]>filter.in).length, `Empty IN clause, query should be avoided`, { [propertyName]: filter });
      }
    }

    return filters;
  }

  protected toSequelizeOptions<T extends TAllSequelizeOptions<A>>(options: Partial<TAllOptions<A>> = {}, overrides: TAllSequelizeOptions<A> = {}): T {
    options = Object.assign({}, options);

    if (options.select) {
      if (!options.select.includes(this.primaryKeyField)) {
        options.select.push(this.primaryKeyField); // Make sure the id is always present
      }
      (<TSequelizeAttributesOption<A>>options).attributes = options.select;
      delete options.select;
    }

    if (options.sort) {
      (<TSequelizeOrderOption<A>>options).order = options.sort.map(item => {
        return <[keyof A, SortOrder]>(Array.isArray(item) ? item : [item, SortOrder.ASC]);
      });
      delete options.sort;
    }

    delete options.decorate;
    delete options.context;

    return <T>Object.assign(options, overrides);
  }

  private async _beforeCreate(session: CreateSession<A>) {
    await this.transform(session);
    await this.beforeCreate(session);
    await this.publish(Hook.WILL_CREATE, session);
  }

  private async _afterCreate(session: CreateSession<A>) {
    await this.afterCreate(session);
    await this.decorate(session);
    await this.publish(Hook.DID_CREATE, session);
  }

  private async _beforeUpdate(session: UpdateSession<A>) {
    await this.transform(session);
    await this.beforeUpdate(session);
    await this.publish(Hook.WILL_UPDATE, session);
  }

  private async _afterUpdate(session: UpdateSession<A>) {
    await this.afterUpdate(session);
    await this.publish(Hook.DID_UPDATE, session);
  }

  public warn(condition: boolean, message: string, data?: object) {
    super.warn(condition, message, data);
  }

  public static async try<T>(callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (err) {
      throw this.formatError(err);
    }
  }

  public static formatError(err: any): Error {
    switch (err.name) {
      case 'SequelizeValidationError':
        const firstErr = err.errors[0];
        err = new BadRequestRestError(firstErr.message, err);
        break;
      case 'SequelizeUniqueConstraintError':
        const keys = err.errors.map((subErr: any) => subErr.path);
        err = new ConflictRestError(`Unique constraint violation : ${keys.join(', ')}.`, err);
        break;
      case 'SequelizeForeignKeyConstraintError':
        err = new BadRequestRestError(`Foreign key constraint violation : ${err.index}.`, err);
        break;
    }

    return err;
  }
}