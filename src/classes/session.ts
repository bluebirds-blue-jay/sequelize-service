import * as Lodash from 'lodash';
import { TContext } from '../types/context';
import { Collection } from '@bluejay/collection';
import * as stringify from 'stringify-object';
import { TAllOptions } from '../types/all-options';
import { TSafeOptions } from '../types/safe-options';
import { TFindOptions } from '../types/find-options';
import { TFilters } from '../types/filters';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { TFiltersMap } from '../types/filters-map';
import { TOptionsMap } from '../types/options-map';
import { ISession } from '../interfaces/session';

export class Session<W extends {}, R extends W, C extends {}, O extends TSafeOptions = TAllOptions<R, C, keyof R, keyof C>> extends Collection<Partial<R> & Partial<C>> implements ISession<W, R, C, O> {
  private context: TContext;
  private options: TOptionsMap<O>;
  private service: ISequelizeService<W, R, C>;
  private filters: TFiltersMap<R>;

  public constructor(
    objects: (Partial<R> & Partial<C>)[],
    options: O,
    service: ISequelizeService<W, R, C>,
    filters?: TFilters<R>
  ) {
    super(objects);
    this.context = options.context || new Map();
    this.options = <TOptionsMap<O>>new Map(Lodash.toPairs(options));
    this.service = service;
    this.filters = <TFiltersMap<R>>new Map(Lodash.toPairs(filters || { [this.service.getPrimaryKeyField()]: null }));
  }

  public getOptions() {
    return this.options;
  }

  public getContext() {
    return this.context;
  }

  public getOption<K extends keyof O>(key: K): O[K] {
    return this.options.get(key);
  }

  public setOption<K extends keyof O>(key: K, value: O[K]): this {
    this.options.set(key, value);
    return this;
  }

  public hasOption(key: keyof O): boolean {
    return this.options.has(key);
  }

  public unsetOption(key: keyof O): this {
    this.options.delete(key);
    return this;
  }

  public getSafeOptions<TR extends {} = R, TC extends {} = C, Select extends keyof R = keyof R, Compute extends keyof C = keyof C>(overrides: Partial<TAllOptions<TR, TC, Select, Compute>> = {}): TSafeOptions {
    const options: TSafeOptions = {};

    for (const key of <(keyof O)[]>['transaction', 'context', 'skipHooks']) {
      options[key as keyof TSafeOptions] = this.options.get(key);
    }

    return Object.assign(options, overrides)
  }

  public getFilters(): TFiltersMap<R> {
    return this.filters;
  }

  public getRawFilters(): TFilters<R> {
    return <any>Lodash.fromPairs(Array.from(this.getFilters()));
  }

  public hasFilters(): boolean {
    return Object.keys(this.getRawFilters()).length > 0;
  }

  public hasFilter(key: keyof R): boolean {
    return this.filters.has(key);
  }

  public isIdentified(): boolean {
    if (!this.size()) {
      return false;
    }

    const primaryKeyField = this.service.getPrimaryKeyField();
    let oneIdentified = false;
    let allIdentified = true;

    for (const object of this.getObjects()) {
      if (primaryKeyField in object) {
        oneIdentified = true;
      } else if (oneIdentified) {
        throw new Error(`Inconsistent non identified object in session : ${stringify(object)}.`);
      } else {
        allIdentified = false;
        break;
      }
    }

    return allIdentified;
  }

  public async fetch<Select extends keyof R, Compute extends keyof C>(options: TFindOptions<R, C, Select, Compute>): Promise<void> {
    this.service.warn(!this.hasFilters() && !('limit' in options), `Fetching entire table.`);

    const primaryKeyField = this.service.getPrimaryKeyField();

    const newObjects = await this.service.find(this.getRawFilters(), options);

    if (this.isIdentified()) {
      for (const object of this) {
        const newObject = newObjects.findByProperties(<any>{ [primaryKeyField]: object[primaryKeyField] });
        if (!newObject) {
          throw new Error(`Unable to find matching object with primary key ${object[primaryKeyField]}.`);
        }
        Object.assign(object, newObject); // Refresh existing object
      }
    } else {
      this.setObjects(newObjects.toArray());
    }
  }

  public async ensureProperties<Select extends keyof R, Compute extends keyof C>(options: TFindOptions<R, C, Select, Compute>): Promise<void> {
    const select = options.select || [];
    const computedProperties = options.compute || [];

    let allSet = true;

    for (const object of this.getObjects()) {
      for (const prop of select) {
        if (!(prop in object)) {
          allSet = false;
          break;
        }
      }

      for (const prop of computedProperties) {
        if (!(prop in object)) {
          allSet = false;
          break;
        }
      }
    }

    if (!this.size() || !allSet) {
      await this.fetch(options);
    }
  }

  public async ensureIdentified(options: TSafeOptions = {}): Promise<void> {
    return await this.ensureProperties(Object.assign(options, { select: [this.service.getPrimaryKeyField()] }));
  }

  protected getService() {
    return this.service;
  }
}