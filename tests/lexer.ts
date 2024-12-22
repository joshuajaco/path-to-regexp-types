import * as assert from "node:assert/strict";
import { Lex } from "../src/lexer";

const ID_START = /^[$_\p{ID_Start}]$/u;
const ID_CONTINUE = /^[$\u200c\u200d\p{ID_Continue}]$/u;

type TokenType =
  | "{"
  | "}"
  | "WILDCARD"
  | "PARAM"
  | "CHAR"
  | "ESCAPED"
  | "END"
  // Reserved for use or ambiguous due to past use.
  | "("
  | ")"
  | "["
  | "]"
  | "+"
  | "?"
  | "!";

interface LexToken {
  type: TokenType;
  index: number;
  value: string;
}

const SIMPLE_TOKENS: Record<string, TokenType> = {
  // Groups.
  "{": "{",
  "}": "}",
  // Reserved.
  "(": "(",
  ")": ")",
  "[": "[",
  "]": "]",
  "+": "+",
  "?": "?",
  "!": "!",
};

function* lexer(str: string): Generator<LexToken, LexToken> {
  const chars = [...str];
  let i = 0;

  function name() {
    let value = "";

    if (ID_START.test(chars[++i])) {
      value += chars[i];
      while (ID_CONTINUE.test(chars[++i])) {
        value += chars[i];
      }
    } else if (chars[i] === '"') {
      let pos = i;

      while (i < chars.length) {
        if (chars[++i] === '"') {
          i++;
          pos = 0;
          break;
        }

        if (chars[i] === "\\") {
          value += chars[++i];
        } else {
          value += chars[i];
        }
      }

      if (pos) {
        throw new TypeError(`Unterminated quote at ${pos}`);
      }
    }

    if (!value) {
      throw new TypeError(`Missing parameter name at ${i}`);
    }

    return value;
  }

  while (i < chars.length) {
    const value = chars[i];
    const type = SIMPLE_TOKENS[value];

    if (type) {
      yield { type, index: i++, value };
    } else if (value === "\\") {
      yield { type: "ESCAPED", index: i++, value: chars[i++] };
    } else if (value === ":") {
      const value = name();
      yield { type: "PARAM", index: i, value };
    } else if (value === "*") {
      const value = name();
      yield { type: "WILDCARD", index: i, value };
    } else {
      yield { type: "CHAR", index: i, value: chars[i++] };
    }
  }

  return { type: "END", index: i, value: "" };
}

function lex(path: string) {
  return [...lexer(path)].map(({ index, ...rest }) => ({ ...rest }));
}

const path = '/foo\\{/:bar}/:"baz-y"/*foo';
const expected: Lex<typeof path> = [
  { type: "CHAR", value: "/" },
  { type: "CHAR", value: "f" },
  { type: "CHAR", value: "o" },
  { type: "CHAR", value: "o" },
  { type: "ESCAPED", value: "{" },
  { type: "CHAR", value: "/" },
  { type: "PARAM", value: "bar" },
  { type: "}", value: "}" },
  { type: "CHAR", value: "/" },
  { type: "PARAM", value: "baz-y" },
  { type: "CHAR", value: "/" },
  { type: "WILDCARD", value: "foo" },
];

assert.deepEqual(lex(path), expected);
