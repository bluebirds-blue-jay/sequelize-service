import { TCreateOptions } from '../types/create-options';
import { ISession } from './session';

export interface ICreateSession<W extends {}, R extends W, C extends {}, KC extends keyof C = keyof C, O extends {} = {}> extends ISession<W, R, C, TCreateOptions<R, C, KC> & O> {

}
