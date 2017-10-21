import { injectable } from 'inversify';
import { ISession } from '../interfaces/sessions/session';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { IComputedPropertiesManager } from '../interfaces/computed-properties-manager';
import { IComputedProperty } from '../interfaces/computed-property';

@injectable()
export abstract class ComputedPropertiesManager<A, CP> implements IComputedPropertiesManager<A, CP> {
  private computedProperties: { [key in keyof CP]: { property: IComputedProperty<A, CP>, dependencies: (keyof CP)[] } };

  public constructor() {
    const defined = this.map();

    this.computedProperties = Object.keys(defined).reduce((acc, key: keyof CP) => {
      if ('property' as keyof CP in defined[key]) {
        acc[key] = <{ property: IComputedProperty<A, CP, CP[keyof CP]>, dependencies: (keyof CP)[] }>defined[key];
      } else {
        acc[key] = { property: <IComputedProperty<A, CP, CP[keyof CP]>>defined[key], dependencies: [] };
      }

      return acc;
    }, {} as { [key in keyof CP]: { property: IComputedProperty<A, CP, CP[key]>, dependencies: (keyof CP)[] } });
  }

  public async transform(session: ISession<A, CP>, service: ISequelizeService<A, CP>) {
    const toCompute = new Set<keyof CP>(session.getOption('compute') || []);

    const sequence: IComputedProperty<A, CP>[][] = [];

    toCompute.forEach(key => {
      let index: number = 0;

      const definition = this.resolve(key);

      if (definition.dependencies.length) {
        for (let i = 0, len = sequence.length; i < len; i++) {
          const current = sequence[i];
          for (const dependencyName of definition.dependencies) {
            const resolvedDependency = this.resolve(dependencyName);
            if (current.includes(resolvedDependency.property)) {
              index = Math.max(i + 1, index);
            }
          }
        }
      }

      if (!sequence[index]) {
        sequence[index] = [definition.property];
      } else {
        sequence[index].push(definition.property);
      }

      sequence[index] = sequence[index] || [];
      sequence[index].push(definition.property);
    });

    for (const group of sequence) {
      await Promise.all(group.map(async computedProperty => {
        await computedProperty.transform(session, service);
      }));
    }
  }

  protected abstract map(): { [key in keyof CP]: IComputedProperty<A, CP, CP[key]> | { property: IComputedProperty<A, CP, CP[key]>, dependencies: (keyof CP)[] } };

  private resolve<K extends keyof CP>(key: K): { property: IComputedProperty<A, CP, CP[K]>, dependencies: (keyof CP)[] } {
    const definition = this.computedProperties[key];
    if (!definition) {
      throw new Error(`No computed property found for name ${key}.`);
    }
    return definition;
  }

}