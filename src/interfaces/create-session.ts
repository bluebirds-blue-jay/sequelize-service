import { Session } from '../classes/session';
import { TCreateOptions } from '../types/create-options';

export interface ICreateSession<W extends {}, R extends W, C extends {}, KC extends keyof C = keyof C> extends Session<W, R, C, TCreateOptions<R, C, KC>> {

}