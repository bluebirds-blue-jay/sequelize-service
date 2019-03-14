import { Session } from './session';
import { TUpsertOptions } from '../types/upsert-options';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { IUpsertSession } from '../interfaces/upsert-session';

export class UpsertSession<W extends {}, R extends W, C extends {}, KC extends keyof C, O extends {} = {}> extends Session<W, R, C, TUpsertOptions<R, C, KC> & O> implements IUpsertSession<W, R, C, KC, O> {
  private created: boolean | undefined = false;

  public constructor(objects: W[], options: TUpsertOptions<R, C> & O, service: ISequelizeService<W, R, C>) {
    super(objects, options, service);
  }

  public setCreated(created: boolean): void {
    this.created = created;
  }

  public isCreated(): boolean | undefined {
    return this.created;
  }

  public isUpdated(): boolean | undefined {
    return this.created === undefined ? undefined : !this.created;
  }
}