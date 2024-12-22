import {
  CharToken,
  EscapedToken,
  Lex,
  LexTokenType,
  ParamToken,
  SimpleToken,
  WildcardToken,
} from "./lexer";

export type Text<T extends string = string> = {
  type: "text";
  value: T;
};

export type Parameter<T extends string = string> = {
  type: "param";
  name: T;
};

export type Wildcard<T extends string = string> = {
  type: "wildcard";
  name: T;
};

export type Group<T extends Token[] = Token[]> = {
  type: "group";
  tokens: T;
};

export type Token = Text | Parameter | Wildcard | Group<Token[]>;

export type Parse<Path extends string> = Consume<Lex<Path>>["tokens"];

type Combine<T, U extends { tokens: any[]; rest: any[] }> = {
  tokens: [T, ...U["tokens"]];
  rest: U["rest"];
};

type Consume<
  Tokens,
  EndToken extends LexTokenType | null = null,
> = Tokens extends [{ type: EndToken }, ...infer Rest]
  ? { tokens: []; rest: Rest }
  : Tokens extends [CharToken | EscapedToken, ...any[]]
    ? Combine<
        Text<ConsumeText<Tokens>["value"]>,
        Consume<ConsumeText<Tokens>["rest"], EndToken>
      >
    : Tokens extends [infer Token extends ParamToken, ...infer Rest]
      ? Combine<Parameter<Token["value"]>, Consume<Rest, EndToken>>
      : Tokens extends [infer Token extends WildcardToken, ...infer Rest]
        ? Combine<Wildcard<Token["value"]>, Consume<Rest, EndToken>>
        : Tokens extends [SimpleToken<"{">, ...infer Rest]
          ? Combine<
              Group<Consume<Rest, "}">["tokens"]>,
              Consume<Consume<Rest, "}">["rest"], EndToken>
            >
          : { tokens: []; rest: [] };

type ConsumeText<Tokens> = Tokens extends [
  infer F extends CharToken | EscapedToken,
  ...infer R,
]
  ? {
      value: `${F["value"]}${ConsumeText<R>["value"]}`;
      rest: ConsumeText<R>["rest"];
    }
  : { value: ""; rest: Tokens };
