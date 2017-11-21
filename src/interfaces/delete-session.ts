import { TDeleteOptions } from '../types/delete-options';
import { ISession } from './session';

export interface IDeleteSession<W, R extends W, C> extends ISession<W, R, C, TDeleteOptions<R>> {

}