import { TDeleteOptions } from '../types/delete-options';
import { ISession } from './session';

export interface IDeleteSession<W extends {}, R extends W, C extends {}, O extends {} = {}> extends ISession<W, R, C, TDeleteOptions<R> & O> {

}
