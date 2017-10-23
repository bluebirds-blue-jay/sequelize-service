import { Session } from '../classes/session';
import { TCreateOptions } from '../types/create-options';

export interface ICreateSession<A, CP> extends Session<A, CP, TCreateOptions<A, CP>> {

}