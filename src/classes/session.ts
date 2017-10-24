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

export class Session<A, CP, O extends TSafeOptions = TAllOptions<A, CP>> extends Collection<A & Partial<CP>> implements ISession<A, CP, O> {
  private context: TContext;
  private options: TOptionsMap<O>;
  private service: ISequelizeService<A, CP>;
  private filters: TFiltersMap<A>;

  public constructor(
    objects: (A & Partial<CP>)[],
    options: O,
    service: ISequelizeService<A, CP>,
    filters?: TFilters<A>
  ) {
    super(objects);
    this.context = options.context || new Map();
    this.options = <TOptionsMap<O>>new Map(Lodash.toPairs(options));
    this.service = service;
    this.filters = <TFiltersMap<A>>new Map(Lodash.toPairs(filters || { [this.service.getPrimaryKeyField()]: null }));
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

  public getSafeOptions<TA extends {} = A, TCP extends {} = CP>(overrides: Partial<TAllOptions<TA, TCP>> = {}): TSafeOptions {
    const options: TSafeOptions = {};

    for (const key of <(keyof O)[]>['transaction', 'context', 'skipHooks']) {
      options[key as keyof TSafeOptions] = this.options.get(key);
    }

    return Object.assign(options, overrides)
  }

  public getFilters(): TFiltersMap<A> {
    return this.filters;
  }

  public getRawFilters(): TFilters<A> {
    return <any>Lodash.fromPairs(Array.from(this.getFilters()));
  }

  public hasFilters(): boolean {
    return Object.keys(this.getRawFilters()).length > 0;
  }

  public hasFilter(key: keyof A): boolean {
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

  public async fetch(options: TFindOptions<A, CP>): Promise<void> {
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

  public async ensureProperties(options: TFindOptions<A, CP>): Promise<void> {
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