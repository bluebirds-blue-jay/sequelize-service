import { Collection, ICollection } from '@bluejay/collection';
import { Service } from '@bluejay/service';
import { pick } from '@bluejay/utils';
import { injectable } from 'inversify';
import * as Lodash from 'lodash';
import { BaseError, DatabaseError, ValidationError } from 'sequelize';
import * as Sequelize from 'sequelize';
import { Config } from '../config';
import { Hook } from '../constants/hook';
import { SortOrder } from '../constants/sort-order';
import { IComputedPropertiesManager } from '../interfaces/computed-properties-manager';
import { ICreateSession } from '../interfaces/create-session';
import { IDeleteSession } from '../interfaces/delete-session';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { ISession } from '../interfaces/session';
import { IUpdateSession } from '../interfaces/update-session';
import { IUpsertSession } from '../interfaces/upsert-session';
import { TAllOptions } from '../types/all-options';
import { TAllSequelizeOptions } from '../types/all-sequelize-options';
import { TCountOptions } from '../types/count-options';
import { TCreateOptions } from '../types/create-options';
import { TDeleteOptions } from '../types/delete-options';
import { TFilters } from '../types/filters';
import { TFindByPrimaryKeyOptions } from '../types/find-by-primary-key-options';
import { TFindOneOptions } from '../types/find-one-options';
import { TFindOptions } from '../types/find-options';
import { TOperatorFilter } from '../types/operator-filter';
import { TReplaceOneOptions } from '../types/replace-one-options';
import { TSequelizeAttributesOption } from '../types/sequelize-attributes-option';
import { TSequelizeCountOptions } from '../types/sequelize-count-options';
import { TSequelizeDestroyOptions } from '../types/sequelize-destroy-options';
import { TSequelizeFindOptions } from '../types/sequelize-find-options';
import { TSequelizeOperatorFilter } from '../types/sequelize-operator-filter';
import { TSequelizeOrderOption } from '../types/sequelize-order-option';
import { TSequelizeWhere } from '../types/sequelize-where';
import { TTransactionOptions } from '../types/transaction-options';
import { TUpdateByPrimaryKeyOptions } from '../types/update-by-primary-key-options';
import { TUpdateOptions } from '../types/update-options';
import { TUpsertOptions } from '../types/upsert-options';
import { TValues } from '../types/values';
import { CreateSession } from './create-session';
import { DeleteSession } from './delete-session';
import { Session } from './session';
import { UpdateSession } from './update-session';
import { UpsertSession } from './upsert-session';

@injectable()
export class SequelizeService<W extends {}, R extends W, C extends {} = {}> extends Service implements ISequelizeService<W, R, C> {
  protected computedPropertiesManager: IComputedPropertiesManager<W, R, C>;
  private primaryKeyField: keyof R = 'id' as keyof R;

  public constructor(protected model: Sequelize.Model<R, R>) {
    super();
  }

  public getPrimaryKeyField(): string | number {
    return this.primaryKeyField as string | number;
  }

  public async create<KC extends keyof C = keyof {}>(object: W, options: TCreateOptions<R, C, KC> = {}): Promise<R & Pick<C, KC>> {
    return await SequelizeService.try(async () => {
      return await this.transaction(options, async () => {
        const createSession = new CreateSession<W, R, C, KC>([object], options, this);
        const session = createSession as ISession<W, R, C>;

        await this.executeHook(Hook.WILL_CREATE, session, this._beforeCreate.bind(this, createSession)); // TODO Make sure the bind calls actually work...

        const created = <R>(<any>await this.model.create(<R>object, options)).toJSON();

        session.setObjects([created]);

        await this.computeProperties(session);

        await this.executeHook(Hook.DID_CREATE, session, this._afterCreate.bind(this, createSession));

        return session.getAt(0) as R & Pick<C, KC>;
      });
    }, this.errorFactory);
  }

  public async createMany<KC extends keyof C = keyof {}>(objects: W[], options: TCreateOptions<R, C, KC> = {}): Promise<ICollection<R & Pick<C, KC>>> {
    return await SequelizeService.try(async () => {
      return await this.transaction(options, async () => {
        const createSession = new CreateSession<W, R, C, KC>(objects, options, this);
        const session = <ISession<W, R, C>>createSession;

        await this.executeHook(Hook.WILL_CREATE, session, this._beforeCreate.bind(this, createSession));

        const created = (await Promise.all(objects.map(async item => {
          return await this.model.create(<R>item, options);
        }))).map(object => {
          return (<any>object).toJSON();
        });

        session.setObjects(created);

        await this.computeProperties(session);

        await this.executeHook(Hook.DID_CREATE, session, this._afterCreate.bind(this, createSession));

        return new Collection<R & Pick<C, KC>>(created);
      });
    }, this.errorFactory);
  }

  public async upsert<KC extends keyof C = keyof {}>(object: W, options: TUpsertOptions<R, C, KC> = {}): Promise<R & Pick<C, KC>> {
    return await SequelizeService.try(async () => {
      return await this.transaction(options, async () => {
        const upsertSession = new UpsertSession<W, R, C, KC>([object], options, this);
        const session = upsertSession as ISession<W, R, C>;

        await this.executeHook(Hook.WILL_UPSERT, session, this._beforeUpsert.bind(this, upsertSession));

        const created = await this.model.upsert(<R>object, options);

        upsertSession.setCreated(created);

        let filters: TFilters<R>;
        if (options.fields) {
          filters = pick(object, options.fields as any as (keyof W)[]) as any as TFilters<R>;
        } else {
          filters = Lodash.clone(object) as any as TFilters<R>;
        }

        const createdObject = await this.findOne(filters, options) as unknown as R;
        upsertSession.setObjects([createdObject]);

        await this.computeProperties(session);

        await this.executeHook(Hook.DID_UPSERT, session, this._afterUpsert.bind(this, upsertSession));

        return upsertSession.getAt(0) as R & Pick<C, KC>;
      });
    }, this.errorFactory);
  }

  public async find<KR extends keyof R, KC extends keyof C = keyof {}>(filters: TFilters<R>, options: TFindOptions<R, C, KR, KC> = {}): Promise<ICollection<Pick<R, KR> & Pick<C, KC>>> {
    const formattedFilters = this.toSequelizeWhere(filters);
    const sequelizeOptions = this.toSequelizeOptions<TSequelizeFindOptions<R>>(options, { where: formattedFilters });

    const objects = (await this.model.findAll(sequelizeOptions as any)).map(object => (<any>object).toJSON()); // TODO Not proud of this one...

    if (objects.length) {
      await this.computeProperties(new Session<W, R, C, TFindOptions<R, C, KR, KC>>(objects, options, this, filters) as ISession<W, R, C>);
    }

    return new Collection(objects);
  }

  public async findOne<KR extends keyof R, KC extends keyof C = keyof {}>(filters: TFilters<R>, options: TFindOneOptions<R, C, KR, KC> = {}): Promise<(Pick<R, KR> & Pick<C, KC>) | null> {
    const [ object ] = await this.find(filters, Object.assign({}, options, { limit: 1 }));
    return object || null;
  }

  public async findByPrimaryKey<KR extends keyof R, KC extends keyof C = keyof {}>(pk: string | number, options: TFindByPrimaryKeyOptions<R, C, KR, KC> = {}): Promise<(Pick<R, KR> & Pick<C, KC>) | null> {
    return await this.findOne({ [this.getPrimaryKeyField()]: pk } as any, options);
  }

  public async findByPrimaryKeys<KR extends keyof R, KC extends keyof C = keyof {}>(pks: string[] | number[], options: TFindByPrimaryKeyOptions<R, C, KR, KC> = {}): Promise<ICollection<Pick<R, KR> & Pick<C, KC>>> {
    return await this.find({ [this.getPrimaryKeyField()]: { in: pks } } as any, options);
  }

  public async update(filters: TFilters<R>, values: TValues<W>, options: TUpdateOptions<R> = {}): Promise<number> {
    return await SequelizeService.try(async () => {
      return await this.transaction(options, async () => {
        const updateSession = new UpdateSession<W, R, C>(filters, values, options, this);
        const session = updateSession as ISession<W, R, C>;

        await this.executeHook(Hook.DID_UPDATE, session, this._beforeUpdate.bind(this, updateSession));

        const formattedFilters = this.toSequelizeWhere(filters);
        const sequelizeOptions = this.toSequelizeOptions<any>(options, { where: formattedFilters });

        const [ count ] = await this.model.update(updateSession.getRawValues() as R, sequelizeOptions);

        await this.executeHook(Hook.DID_UPDATE, session, this._afterUpdate.bind(this, updateSession));

        return count;
      });
    }, this.errorFactory);
  }

  public async updateByPrimaryKey(pk: string | number, values: TValues<W>, options: TUpdateByPrimaryKeyOptions<R> = {}): Promise<number> {
    return await this.update({ [this.getPrimaryKeyField()]: pk } as any, values, options);
  }

  public async delete(filters: TFilters<R>, options: TDeleteOptions<R> = {}): Promise<number> {
    return await this.transaction(options, async () => {
      const deleteSession = new DeleteSession(filters, options, this);
      const session = <ISession<W, R, C>>deleteSession;

      await this.executeHook(Hook.WILL_DELETE, session, this._beforeDelete.bind(this, deleteSession));

      const formattedFilters = this.toSequelizeWhere(filters);
      const sequelizeOptions = this.toSequelizeOptions<TSequelizeDestroyOptions<R>>(options, { where: formattedFilters });

      const count = await this.model.destroy(sequelizeOptions);

      await this.executeHook(Hook.DID_DELETE, session, this._afterDelete.bind(this, deleteSession));

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
        paranoid: options.paranoid,
        transaction: options.transaction,
        lock: Sequelize.Transaction.LOCK.UPDATE
      });

      if (candidate) {
        const primaryKeyFilter = (<any>candidate)[this.getPrimaryKeyField()];
        await this.updateByPrimaryKey(primaryKeyFilter, values, options);
        // Return the updated object for consistency
        return <R & Pick<C, KC>>await this.findByPrimaryKey(primaryKeyFilter, options);
      } else {
        return await this.create(values, options);
      }
    });
  }

  public warn(condition: boolean, message: string, data?: object) {
    super.warn(condition, message, data);
  }

  protected async beforeDelete(session: IDeleteSession<W, R, C>) { /* Nothing */ }
  protected async afterDelete(session: IDeleteSession<W, R, C>) { /* Nothing */ }
  protected async beforeUpdate(session: IUpdateSession<W, R, C>) { /* Nothing */ }
  protected async afterUpdate(session: IUpdateSession<W, R, C>) { /* Nothing */ }
  protected async beforeCreate(session: ICreateSession<W, R, C, keyof C>) { /* Nothing */ }
  protected async afterCreate(session: ICreateSession<W, R, C, keyof C>) { /* Nothing */ }
  protected async beforeUpsert(session: IUpsertSession<W, R, C>) { /* Nothing */ }
  protected async afterUpsert(session: IUpsertSession<W, R, C>) { /* Nothing */ }

  protected errorFactory(err: ValidationError | DatabaseError | BaseError | Error) {
    return Config.get('errorFactory')(err);
  }

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

        this.warn(!!filter.in && !(<any[]>filter.in).length, `Empty IN clause, query should be avoided`, { [propertyName]: filter });

        for (const operator of Object.getOwnPropertyNames(filter)) {
          if (Collection.isCollection<any>(filter[operator])) {
            filter[operator] = filter[operator].toArray();
          }
        }
      }
    }

    return filters as TSequelizeWhere<R>;
  }

  protected toSequelizeOptions<T extends TAllSequelizeOptions<R>>(options: Partial<TAllOptions<R, C, keyof R, keyof C>> = {}, overrides: TAllSequelizeOptions<R> = {}): T {
    options = Object.assign({}, options);

    if (options.select) {
      if (Collection.isCollection<keyof R>(options.select)) {
        options.select = options.select.toArray();
      }
      if (!options.select.includes(this.primaryKeyField)) {
        options.select.push(this.primaryKeyField); // Make sure the id is always present
      }
      (<TSequelizeAttributesOption<R>>options).attributes = options.select;
      delete options.select;
    }

    if (options.sort) {
      if (Collection.isCollection<keyof R | [keyof R, SortOrder]>(options.sort)) {
        options.sort = options.sort.toArray();
      }
      (<TSequelizeOrderOption<W>>options).order = options.sort.map(item => {
        return <[keyof W, SortOrder]>(Array.isArray(item) ? item : [item, SortOrder.ASC]);
      });
      delete options.sort;
    }

    delete options.compute;
    delete options.context;

    return <T>Config.get('sequelizeOptionsModifier')(Object.assign(options, overrides));
  }

  private async _beforeCreate(session: ICreateSession<W, R, C, keyof C>) {
    await this.beforeCreate(session);
    await this.publish(Hook.WILL_CREATE, session);
  }

  private async _afterCreate(session: ICreateSession<W, R, C, keyof C>) {
    await this.afterCreate(session);
    await this.publish(Hook.DID_CREATE, session);
  }

  private async _beforeUpsert(session: IUpsertSession<W, R, C>) {
    await this.beforeUpsert(session);
    await this.publish(Hook.WILL_UPSERT, session);
  }

  private async _afterUpsert(session: IUpsertSession<W, R, C>) {
    await this.afterUpsert(session);
    await this.publish(Hook.DID_UPSERT, session);
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

  public static async try<T>(callback: () => Promise<T>, errorFactory?: (err: ValidationError | DatabaseError | BaseError | Error) => Error): Promise<T> {
    try {
      return await callback();
    } catch (err) {
      throw Config.get('errorFactory', errorFactory)(err);
    }
  }
}
