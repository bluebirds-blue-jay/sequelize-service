import { IComputedProperty } from '../interfaces/computed-property';

export type TComputedProperties<A, CP> = { [key in keyof CP]: IComputedProperty<A, CP, CP[key]> };