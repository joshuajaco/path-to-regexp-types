import { Parse, Parameter, Wildcard, Group } from "./parser";

export type Params<Path extends string> = _Params<Parse<Path>, false>;

type _Params<Tokens, InGroup extends boolean> = Tokens extends [
  infer T extends Parameter,
  ...infer R,
]
  ? (InGroup extends true
      ? { [P in T["name"]]?: string }
      : { [P in T["name"]]: string }) &
      _Params<R, InGroup>
  : Tokens extends [infer T extends Wildcard, ...infer R]
    ? (InGroup extends true
        ? { [P in T["name"]]?: string[] }
        : { [P in T["name"]]: string[] }) &
        _Params<R, InGroup>
    : Tokens extends [infer T extends Group, ...infer R]
      ? _Params<T["tokens"], true> & _Params<R, InGroup>
      : Tokens extends [any, ...infer R]
        ? _Params<R, InGroup>
        : {};
