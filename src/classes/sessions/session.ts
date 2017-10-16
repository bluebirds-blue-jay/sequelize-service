import * as Lodash from 'lodash';
import { TContext } from '../../types/context';
import { Collection } from '@bluejay/collection';
import * as stringify from 'stringify-object';
import { TAllOptions } from '../../types/all-options';
import { TSafeOptions } from '../../types/safe-options';
import { TFindOptions } from '../../types/find-options';
import { TFilters } from '../../types/filters';
import { ISequelizeService } from '../../interfaces/sequelize-service';
import { TFiltersMap } from '../../types/filters-map';
import { TOptionsMap } from '../../types/options-map';

export class Session<A, O extends TSafeOptions = TAllOptions<A>> extends Collection<A> {
  private context: TContext;
  private options: TOptionsMap<O>;
  private service: ISequelizeService<A, any>;
  private filters: TFiltersMap<A>;
  private decorations: Set<keyof A>;

  public constructor(
    objects: A[],
    options: O,
    service: ISequelizeService<A, any>,
    filters?: TFilters<A>
  ) {
    super(objects);
    this.context = options.context || new Map();
    this.options = <TOptionsMap<O>>new Map(Lodash.toPairs(options));
    this.service = service;
    this.filters = <TFiltersMap<A>>new Map(Lodash.toPairs(filters || { [this.service.getPrimaryKeyField()]: null }));
    this.decorations = new Set((<TAllOptions<A>>options).decorate || []);
  }

  public getOptions() {
    return this.options;
  }

  public getContext() {
    return this.context;
  }

  public getDecorations() {
    return this.decorations;
  }

  public hasDecoration(decoration: keyof A): boolean {
    return this.getDecorations().has(decoration);
  }

  public getSafeOptions<T = A>(overrides: Partial<TAllOptions<T>> = {}): TSafeOptions {
    return Object.assign(Lodash.pick(this.options, ['transaction', 'context', 'skipHooks']), overrides);
  }

  public async ensureIdentified(options: TFindOptions<A>) {
    return await this.ensureProperties(Object.assign(options, { select: [this.service.getPrimaryKeyField()] }));
  }

  public async ensureProperties(options: TFindOptions<A>) {
    const select = options.select || [];
    const decorations = options.decorate || [];
    const allProps = select.concat(decorations);

    let allSet = true;

    for (const object of this) {
      for (const prop of allProps) {
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

  public isIdentified(): boolean {
    if (!this.size()) {
      return false;
    }

    const primaryKeyField = this.service.getPrimaryKeyField();
    let oneIdentified = false;
    let allIdentified = true;

    for (const object of this) {
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

  public async fetch(options: TFindOptions<A>): Promise<this> {
    this.service.warn(!this.hasFilters() && !('limit' in options), `Fetching entire table.`);

    const primaryKeyField = this.service.getPrimaryKeyField();

    const newObjects = await this.service.find(this.getRawFilters(), options);

    if (this.isIdentified()) {
      for (const object of this) {
        const newObject = newObjects.find(newObject => {
          return newObject[primaryKeyField] === object[primaryKeyField];
        });
        if (!newObject) {
          throw new Error(`Unable to find matching object with primary key ${object[primaryKeyField]}.`);
        }
        Object.assign(object, newObject); // Refresh existing object
      }
    } else {
      this.setObjects(newObjects.toArray());
    }

    return this;
  }

  protected getService() {
    return this.service;
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
}