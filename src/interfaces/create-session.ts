import { Session } from '../classes/session';
import { TCreateOptions } from '../types/create-options';

export interface ICreateSession<W extends {}, R extends W, C extends {}, Compute extends keyof C> extends Session<W, R, C, TCreateOptions<R, C, Compute>> {

}