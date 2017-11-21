import { injectable } from 'inversify';
import { ISession } from '../interfaces/session';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { IComputedPropertiesManager } from '../interfaces/computed-properties-manager';
import { IComputedProperty } from '../interfaces/computed-property';

@injectable()
export abstract class ComputedPropertiesManager<W extends {}, R extends W, C extends {}> implements IComputedPropertiesManager<W, R, C> {
  private computedProperties: { [key in keyof C]: { property: IComputedProperty<W, R, C>, dependencies: (keyof C)[] } };

  public async transform(session: ISession<W, R, C>, service: ISequelizeService<W, R, C>) {
    const toCompute = new Set<keyof C>(session.getOption('compute') || []);

    const sequence: IComputedProperty<W, R, C>[][] = [];

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

  protected abstract map(): { [key in keyof C]: IComputedProperty<W, R, C, C[key]> | { property: IComputedProperty<W, R, C, C[key]>, dependencies: (keyof C)[] } };

  private getComputedProperties() {
    if (!this.computedProperties) {
      const defined = this.map();

      this.computedProperties = Object.keys(defined).reduce((acc, key: keyof C) => {
        if ('property' as keyof C in defined[key]) {
          acc[key] = <{ property: IComputedProperty<W, R, C, C[keyof C]>, dependencies: (keyof C)[] }>defined[key];
        } else {
          acc[key] = { property: <IComputedProperty<W, R, C, C[keyof C]>>defined[key], dependencies: [] };
        }

        return acc;
      }, {} as { [key in keyof C]: { property: IComputedProperty<W, R, C, C[key]>, dependencies: (keyof C)[] } });
    }

    return this.computedProperties;
  }

  private resolve<K extends keyof C>(key: K): { property: IComputedProperty<W, R, C, C[K]>, dependencies: (keyof C)[] } {
    const definition = this.getComputedProperties()[key];
    if (!definition) {
      throw new Error(`No computed property found for name ${key}.`);
    }
    return definition;
  }

}