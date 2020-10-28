type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? A : B;

type ReadonlyKeys<M> = {
  [P in keyof M]-?: IfEquals<{ [Q in P]: M[P] }, { -readonly [Q in P]: M[P] }, never, P>
}[keyof M];

export type TMembers = { [column: string]: any; };

export type TReadMembers<M extends TMembers> = {
  readonly [P in keyof M]-?: Exclude<M[P], never>;
};

export type TCreateMembers<M extends TMembers> = Omit<M, ReadonlyKeys<M>>;

export type TUpdateMembers<M extends TMembers> = Partial<Omit<M, ReadonlyKeys<M>>>;
