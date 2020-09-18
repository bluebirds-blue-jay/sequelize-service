import { TContext } from './context';

export type TContextOption<CT extends {} = any> = { context: TContext<CT> };
