import { Service } from '@bluejay/service';
import { ISequelizeService } from '../interfaces/sequelize-service';
import * as Sequelize from 'sequelize';
import { injectable } from 'inversify';
import { TTransactionOptions } from '../types/transaction-options';
import { TCreateOptions } from '../types/create-options';
import { BadRequestRestError, ConflictRestError } from '@bluejay/rest-errors';
import { CreateSession } from './create-session';
import { TFilters } from '../types/filters';
import { TFindOptions } from '../types/find-options';
import { Hook } from '../constants/hook';
import { Session } from './session';
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
import { UpdateSession } from './update-session';
import { TUpdateByPrimaryKeyOptions } from '../types/update-by-primary-key-options';
import { TDeleteOptions } from '../types/delete-options';
import { TSequelizeDestroyOptions } from '../types/sequelize-destroy-options';
import { DeleteSession } from './delete-session';
import { TCountOptions } from '../types/count-options';
import { TSequelizeCountOptions } from '../types/sequelize-count-options';
import { TReplaceOneOptions } from '../types/replace-one-options';
import { IComputedPropertiesManager } from '../interfaces/computed-properties-manager';
import { IUpdateSession } from '../interfaces/update-session';
import { ISession } from '../interfaces/session';
import { ICreateSession } from '../interfaces/create-session';
import { IDeleteSession } from '../interfaces/delete-session';

@injectable()
export class SequelizeService<W extends {}, R extends W, C extends {} = {}> extends Service implements ISequelizeService<W, R, C> {
  private primaryKeyField: keyof R = 'id' as keyof R;
  protected computedPropertiesManager: IComputedPropertiesManager<W, R, C>;

  public constructor(protected model: Sequelize.Model<R, R>) {
    super();
  }

  public getPrimaryKeyField() {
    return this.primaryKeyField;
  }

  public async create<KC extends keyof C = keyof {}>(object: W, options: TCreateOptions<R, C, KC> = {}): Promise<R & Pick<C, KC>> {
    return await SequelizeService.try(async () => {
      return await this.transaction(options, async () => {
        const session = <ISession<W, R, C>>new CreateSession<W, R, C, KC>([object], options, this);

        await this.executeHook(Hook.WILL_CREATE, session, this._beforeCreate.bind(this));

        const created = <R>(<any>await this.model.create(<R>object, options)).toJSON();

        session.setObjects([created]);

        await this.computeProperties(session);

        await this.executeHook(Hook.DID_CREATE, session, this._afterCreate.bind(this));

        return session.getAt(0) as R & Pick<C, KC>;
      });
    });
  }

  public async createMany<KC extends keyof C = keyof {}>(objects: W[], options: TCreateOptions<R, C, KC> = {}): Promise<Collection<R & Pick<C, KC>>> {
    return await SequelizeService.try(async () => {
      return await this.transaction(options, async () => {
        const session = <ISession<W, R, C>>new CreateSession<W, R, C, KC>(objects, options, this);

        await this.executeHook(Hook.WILL_CREATE, session, this._beforeCreate.bind(this));

        const created = (await Promise.all(objects.map(async item => {
          return await this.model.create(<R>item, options);
        }))).map(object => {
          return (<any>object).toJSON();
        });

        session.setObjects(created);

        await this.computeProperties(session);

        await this.executeHook(Hook.DID_CREATE, session, this._afterCreate.bind(this));

        return new Collection(created);
      });
    });
  }

  public async find<KR extends keyof R, KC extends keyof C = keyof {}>(filters: TFilters<R>, options: TFindOptions<R, C, KR, KC> = {}): Promise<Collection<Pick<R, KR> & Pick<C, KC>>> {
    const formattedFilters = this.toSequelizeWhere(filters);
    const sequelizeOptions = this.toSequelizeOptions<TSequelizeFindOptions<R>>(options, { where: formattedFilters });

    const objects = (await this.model.findAll(sequelizeOptions)).map(object => (<any>object).toJSON());

    if (objects.length) {
      await this.computeProperties(new Session<W, R, C, TFindOptions<R, C, KR, KC>>(objects, options, this, filters));
    }

    return new Collection(objects);
  }

  public async findOne<KR extends keyof R, KC extends keyof C = keyof {}>(filters: TFilters<R>, options: TFindOneOptions<R, C, KR, KC> = {}): Promise<Pick<R, KR> & Pick<C, KC>> {
    const [ object ] = await this.find(filters, Object.assign(options, { limit: 1 }));
    return object || null;
  }

  public async findByPrimaryKey<KR extends keyof R, KC extends keyof C = keyof {}>(pk: string | number, options: TFindByPrimaryKeyOptions<R, C, KR, KC> = {}): Promise<Pick<R, KR> & Pick<C, KC>> {
    return await this.findOne({ [this.getPrimaryKeyField()]: pk } as any, options);
  }

  public async findByPrimaryKeys<KR extends keyof R, KC extends keyof C = keyof {}>(pks: string[] | number[], options: TFindByPrimaryKeyOptions<R, C, KR, KC> = {}): Promise<Collection<Pick<R, KR> & Pick<C, KC>>> {
    return await this.find({ [this.getPrimaryKeyField()]: { in: pks } } as any, options);
  }

  public async update(filters: TFilters<R>, values: TValues<W>, options: TUpdateOptions<R> = {}): Promise<number> {
    return await this.transaction(options, async () => {
      const session = <ISession<W, R, C>>new UpdateSession<W, R, C>(filters, values, options, this);
      await this.executeHook(Hook.DID_UPDATE, session, this._beforeUpdate.bind(this));
      const formattedFilters = this.toSequelizeWhere(filters);
      const sequelizeOptions = this.toSequelizeOptions<any>(options, { where: formattedFilters });
      const [ count ] = await this.model.update(<R>values, sequelizeOptions);
      await this.executeHook(Hook.DID_UPDATE, session, this._afterUpdate.bind(this));
      return count;
    });
  }

  public async updateByPrimaryKey(pk: string | number, values: TValues<W>, options: TUpdateByPrimaryKeyOptions<R> = {}): Promise<number> {
    return await this.update({ [this.getPrimaryKeyField()]: pk } as any, values, options);
  }

  public async delete(filters: TFilters<R>, options: TDeleteOptions<R> = {}): Promise<number> {
    return await this.transaction(options, async () => {
      const session = <ISession<W, R, C>>new DeleteSession(filters, options, this);
      await this.executeHook(Hook.WILL_DELETE, session, this._beforeDelete.bind(this));
      const formattedFilters = this.toSequelizeWhere(filters);
      const sequelizeOptions = this.toSequelizeOptions<TSequelizeDestroyOptions<R>>(options, { where: formattedFilters });
      const count = await this.model.destroy(sequelizeOptions);
      await this.executeHook(Hook.DID_DELETE, session, this._afterDelete.bind(this));
      return count;
    });
  }

  public async count(filters: TFilters<R>, options: TCountOptions<R> = {}): Promise<number> {
    const formattedFilters = this.toSequelizeWhere(filters);
    const sequelizeOptions = this.toSequelizeOptions<TSequelizeCountOptions<R>>(options, { where: formattedFilters });
    return await this.model.count(sequelizeOptions);
  }

  public async replaceOne<KC extends keyof C = keyof {}>(filters: TFilters<R>, values: W, options: TReplaceOneOptions<R, C, KC> = {}): Promise<R & Pick<C, KC>> {
    return await this.transaction(options, async () => {
      const candidate = await this.findOne(filters, {
        transaction: options.transaction,
        lock: Sequelize.Transaction.LOCK.UPDATE
      });

      if (candidate) {
        const primaryKeyFilter = (<any>candidate)[this.getPrimaryKeyField()];
        await this.updateByPrimaryKey(primaryKeyFilter, values, options);
        // Return the updated object for consistency
        return await this.findByPrimaryKey(primaryKeyFilter, options);
      } else {
        return await this.create(values, options);
      }
    });
  }

  protected async beforeDelete(session: IDeleteSession<W, R, C>) {}
  protected async afterDelete(session: IDeleteSession<W, R, C>) {}
  protected async beforeUpdate(session: IUpdateSession<W, R, C>) {}
  protected async afterUpdate(session: IUpdateSession<W, R, C>) {}
  protected async beforeCreate(session: ICreateSession<W, R, C, keyof C>) {}
  protected async afterCreate(session: ICreateSession<W, R, C, keyof C>) {}

  protected async computeProperties(session: ISession<W, R, C>) {
    if (this.hasComputedProperties()) {
      await this.computedPropertiesManager.transform(session, this);
    }
  }

  protected async executeHook(hook: Hook, session: ISession<W, R, C>, handler: (session: ISession<W, R, C>) => Promise<any>) {
    if (session.getOption('skipHooks')) {
      return;
    }

    await handler(session);
  }

  protected hasComputedProperties(): boolean {
    return !!this.computedPropertiesManager;
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

  protected toSequelizeWhere(filters: TFilters<R>): TSequelizeWhere<R> {
    for (const propertyName of Object.getOwnPropertyNames(filters)) {
      const filter = <TOperatorFilter<R> & TSequelizeOperatorFilter<R>>filters[propertyName as keyof R];

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

  protected toSequelizeOptions<T extends TAllSequelizeOptions<R>>(options: Partial<TAllOptions<R, C, keyof R, keyof C>> = {}, overrides: TAllSequelizeOptions<R> = {}): T {
    options = Object.assign({}, options);

    if (options.select) {
      if (!options.select.includes(this.primaryKeyField)) {
        options.select.push(this.primaryKeyField); // Make sure the id is always present
      }
      (<TSequelizeAttributesOption<R>>options).attributes = options.select;
      delete options.select;
    }

    if (options.sort) {
      (<TSequelizeOrderOption<W>>options).order = options.sort.map(item => {
        return <[keyof W, SortOrder]>(Array.isArray(item) ? item : [item, SortOrder.ASC]);
      });
      delete options.sort;
    }

    delete options.compute;
    delete options.context;

    return <T>Object.assign(options, overrides);
  }

  private async _beforeCreate(session: ICreateSession<W, R, C, keyof C>) {
    await this.beforeCreate(session);
    await this.publish(Hook.WILL_CREATE, session);
  }

  private async _afterCreate(session: ICreateSession<W, R, C, keyof C>) {
    await this.afterCreate(session);
    await this.publish(Hook.DID_CREATE, session);
  }

  private async _beforeUpdate(session: IUpdateSession<W, R, C>) {
    await this.beforeUpdate(session);
    await this.publish(Hook.WILL_UPDATE, session);
  }

  private async _afterUpdate(session: IUpdateSession<W, R, C>) {
    await this.afterUpdate(session);
    await this.publish(Hook.DID_UPDATE, session);
  }

  private async _beforeDelete(session: IDeleteSession<W, R, C>) {
    await this.beforeDelete(session);
    await this.publish(Hook.WILL_DELETE, session);
  }
  private async _afterDelete(session: IDeleteSession<W, R, C>) {
    await this.afterDelete(session);
    await this.publish(Hook.DID_DELETE, session);
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