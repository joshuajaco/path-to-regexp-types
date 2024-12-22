import * as assert from "node:assert/strict";
import { Parse } from "../src/parser";
import { parse } from "path-to-regexp";

const path = '/foo\\{{/:bar{/bingo}}/:"baz-y"/*foo';

const expected: Parse<typeof path> = [
  {
    type: "text",
    value: "/foo{",
  },
  {
    type: "group",
    tokens: [
      {
        type: "text",
        value: "/",
      },
      {
        type: "param",
        name: "bar",
      },
      {
        type: "group",
        tokens: [
          {
            type: "text",
            value: "/bingo",
          },
        ],
      },
    ],
  },
  {
    type: "text",
    value: "/",
  },
  {
    type: "param",
    name: "baz-y",
  },
  {
    type: "text",
    value: "/",
  },
  {
    type: "wildcard",
    name: "foo",
  },
];

assert.deepEqual(parse(path).tokens, expected);
