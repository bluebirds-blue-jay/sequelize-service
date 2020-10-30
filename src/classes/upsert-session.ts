import { ISequelizeService } from '../interfaces/sequelize-service';
import { IUpsertSession } from '../interfaces/upsert-session';
import { TUpsertOptions } from '../types/upsert-options';
import { Session } from './session';

export class UpsertSession<W extends {}, R extends W, C extends {}, KC extends keyof C, O extends {} = {}> extends Session<W, R, C, TUpsertOptions<R, C, KC> & O> implements IUpsertSession<W, R, C, KC, O> {
  private get created() {
    if (this._created === undefined) {
      throw new Error(`UpsertSession has not yet run.`);
    }

    return this._created;
  }
  private _created: boolean;

  public constructor(objects: W[], options: TUpsertOptions<R, C, KC> & O, service: ISequelizeService<W, R, C>) {
    super(objects, options, service);
  }

  public setCreated(created: boolean): void {
    this._created = created;
  }

  public isCreated(): boolean {
    return this.created;
  }

  public isUpdated(): boolean {
    return !this.created;
  }
}
