# Extended JSON Merge

- converting ops

  - `arrayify` - convert src and target value to array if they aren't array
  - `stringify` - convert src and target values to strings

- cmd and mod ops

- `add ascend/descend arrayify` - for array
- `add pre/post arrayify/stringify` - for string, buffer, typed array, and array
- `del` - for any type, delete field
- `xmerge` - for array, run xmerge on elements of two arrays
- `uniq ascend/descend/pre/post arrayify` - for array (add according to attribute and then unique by value)

- `if-not-exist` - for any type (even `undefined`)

- function

- chain pre/post
- replace
- clone pre/post

```js
{
  "cat /~xmerge(add start)": [ "hello" ],
  "foo /~xmerge(add ascend arrayify)": [ 90 ],
  "bar /~xmerge(add start stringify)": "blah"
}
```

## Example

```js
const result = xmerge(
  {},
  { arr: [50], del: "hello", bar: "oops" },
  { "arr ~@": [25], "lit1 ~~": "set" },
  { "arr ~+": [30] },
  { "del ~-": null },
  { "foo ~?": "default", "bar ~?": "blah" }
);

// =>

result ===
  {
    arr: [25, 50, 30],
    "~lit1": "set",
    foo: "default",
    bar: "oops"
  };
```

## Default Behaviors

- Array - Append
- `null` - Delete
