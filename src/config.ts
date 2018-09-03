import { BadRequestRestError, ConflictRestError } from '@bluejay/rest-errors';
import * as Lodash from 'lodash';
import { BaseError, DatabaseError, ValidationError } from 'sequelize';
import { TAllSequelizeOptions } from './types/all-sequelize-options';

export type TConfigProperties = {
  errorFactory: (err: ValidationError | DatabaseError | BaseError | Error) => Error;
  sequelizeOptionsModifier: <R extends {} = {}>(options: Partial<TAllSequelizeOptions<R>>) => Partial<TAllSequelizeOptions<R>>;
};

export abstract class Config {
  private static properties: TConfigProperties = {
    errorFactory: (originalErr: ValidationError | DatabaseError | Error): Error => {
      let err: Error = originalErr;

      switch (originalErr.name) {
        case 'SequelizeValidationError':
          const firstErr = (originalErr as ValidationError).errors[0];
          err = new BadRequestRestError(firstErr.message, originalErr);
          break;
        case 'SequelizeUniqueConstraintError':
          const keys = (originalErr as ValidationError).errors.map((subErr: any) => subErr.path);
          err = new ConflictRestError(`Unique constraint violation : ${keys.join(', ')}.`, originalErr);
          break;
        case 'SequelizeForeignKeyConstraintError':
          err = new BadRequestRestError(`Foreign key constraint violation : ${(originalErr as any).index}.`, originalErr);
          break;
      }

      return err || originalErr;
    },
    sequelizeOptionsModifier: (options) => options
  };

  public static get<K extends keyof TConfigProperties>(propertyName: K, useIfExists?: TConfigProperties[K] | null, existsIfNull = false): TConfigProperties[K] {
    if (!Lodash.isNil(useIfExists) || (Lodash.isNull(useIfExists) && existsIfNull)) {
      return useIfExists as TConfigProperties[K];
    }

    return this.properties[propertyName];
  }

  public static set<K extends keyof TConfigProperties>(propertyName: K, value: TConfigProperties[K]): void {
    this.properties[propertyName] = value;
  }
}