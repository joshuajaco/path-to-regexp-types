type SimpleChar = "{" | "}" | "(" | ")" | "[" | "]" | "+" | "?" | "!";

export type SimpleToken<T extends SimpleChar = SimpleChar> = T extends T
  ? { type: T; value: T }
  : never;

export type ParamToken<T extends string = string> = {
  type: "PARAM";
  value: T;
};
export type WildcardToken<T extends string = string> = {
  type: "WILDCARD";
  value: T;
};
export type CharToken<T extends string = string> = {
  type: "CHAR";
  value: T;
};
export type EscapedToken<T extends string = string> = {
  type: "ESCAPED";
  value: T;
};

export type LexToken =
  | SimpleToken
  | ParamToken
  | WildcardToken
  | CharToken
  | EscapedToken;

export type LexTokenType = LexToken["type"];

export type Lex<Path extends string> =
  Path extends `${infer Char extends SimpleChar}${infer Rest}`
    ? [SimpleToken<Char>, ...Lex<Rest>]
    : Path extends `\\${infer Char}${infer Rest}`
      ? [EscapedToken<Char>, ...Lex<Rest>]
      : Path extends `:${infer Rest}`
        ? [ParamToken<MatchName<Rest>[0]>, ...Lex<MatchName<Rest>[1]>]
        : Path extends `*${infer Rest}`
          ? [WildcardToken<MatchName<Rest>[0]>, ...Lex<MatchName<Rest>[1]>]
          : Path extends `${infer Char}${infer Rest}`
            ? [CharToken<Char>, ...Lex<Rest>]
            : [];

// prettier-ignore
type UppercaseCharacters = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N'
    | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
// prettier-ignore
type LowerCaseCharacters = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n'
    | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
type CharNumbers = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type IDStart = UppercaseCharacters | LowerCaseCharacters | "_" | "$";
type IDContinue = UppercaseCharacters | LowerCaseCharacters | CharNumbers | "_";

type MatchName<T extends string> =
  T extends `${infer C extends IDStart}${infer R}`
    ? [`${C}${MatchNameInner<R>[0]}`, MatchNameInner<R>[1]]
    : T extends `"${infer R}`
      ? [MatchQuoted<R>[0], MatchQuoted<R>[1]]
      : ["", T];

type MatchNameInner<T extends string> =
  T extends `${infer C extends IDContinue}${infer R}`
    ? [`${C}${MatchNameInner<R>[0]}`, MatchNameInner<R>[1]]
    : ["", T];

type MatchQuoted<T extends string> = T extends `\\${infer C}${infer R}`
  ? [`${C}${MatchQuoted<R>[0]}`, MatchQuoted<R>[1]]
  : T extends `"${infer R}`
    ? ["", R]
    : T extends `${infer C}${infer R}`
      ? [`${C}${MatchQuoted<R>[0]}`, MatchQuoted<R>[1]]
      : ["", T];
