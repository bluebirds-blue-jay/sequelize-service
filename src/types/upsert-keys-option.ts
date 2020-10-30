export type TUpsertKeysOption<C> = { fields: (Extract<keyof C, string>)[] };
