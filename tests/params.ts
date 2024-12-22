import assert from "node:assert/strict";
import { Params } from "../src/params";
import { match } from "path-to-regexp";

{
  const path = "/foo/:bar";
  const fn = match(path);
  const expected: Params<typeof path> = { bar: "baz" };
  const result = fn("/foo/baz");
  if (result) assert.deepEqual(Object.assign({}, result.params), expected);
  else throw new Error("");
}

{
  const path = "/foo/*bar";
  const fn = match(path);
  const expected: Params<typeof path> = { bar: ["baz"] };
  const result = fn("/foo/baz");
  if (result) assert.deepEqual(Object.assign({}, result.params), expected);
  else throw new Error("");
}

{
  const path = "/foo{/*bar}";
  const fn = match(path);
  {
    const expected: Params<typeof path> = { bar: ["baz"] };
    const result = fn("/foo/baz");
    if (result) assert.deepEqual(Object.assign({}, result.params), expected);
    else throw new Error("");
  }
  {
    const expected: Params<typeof path> = {};
    const result = fn("/foo");
    if (result) assert.deepEqual(Object.assign({}, result.params), expected);
    else throw new Error("");
  }
}
{
  const path = '/foo\\{{/*bar{/bingo}}/:"baz-y"/*foo';
  const fn = match(path);
  {
    const result = fn("/foo{/1/2");
    const expected: Params<typeof path> = { "baz-y": "1", foo: ["2"] };
    if (result) assert.deepEqual(Object.assign({}, result.params), expected);
    else throw new Error("");
  }
  {
    const result = fn("/foo{/1/2/3");
    const expected: Params<typeof path> = {
      bar: ["1"],
      "baz-y": "2",
      foo: ["3"],
    };
    if (result) assert.deepEqual(Object.assign({}, result.params), expected);
    else throw new Error("");
  }
}
