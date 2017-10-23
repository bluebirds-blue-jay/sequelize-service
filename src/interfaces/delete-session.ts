import { TDeleteOptions } from '../types/delete-options';
import { ISession } from './session';

export interface IDeleteSession<A, CP> extends ISession<A, CP, TDeleteOptions<A>> {

}