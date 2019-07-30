// more specific typeof

// const builtIns = {
//   String: "String",
//   Object: "Object",
//   Array: "Array",
//   AsyncFunction: "AsyncFunction",
//   Function: "Function",
//   RegExp: "RegExp",
//   Buffer: "Buffer",
//   Date: "Date",
//   Number: "Number",
//   Boolean: "Boolean"
// };

module.exports = function stypeof(o) {
  if (o === null) return "Null";
  if (o === undefined) return "Undefined";
  if (isNaN(o)) return "NaN";
  if (o.constructor) return o.constructor.name;

  throw new Error(`type ${o} has no constructor`);
};
