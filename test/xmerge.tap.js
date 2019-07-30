const tap = require("tap");
const _ = require("lodash");

function mutateObj(obj) {
  if (typeof obj !== "object") {
    return `mutate-${Date.now()}`;
  }

  if (obj instanceof Date) {
    return `mutate-date-${Date.now()}`;
  }

  for (const k in obj) {
    const v = obj[k];
    if (Array.isArray(v)) {
      for (let x = 0; x < v.length; x++) {
        v[x] = mutateObj(v[x]);
      }
    } else {
      obj[k] = mutateObj(v);
    }
  }

  return obj;
}

const xmerge = require("..");

tap.test("xmerge", function(test) {
  const b = xmerge({}, { a: 5 });
  test.match(b, { a: 5 });

  const s2 = { a: 5, b: "5", c: { m: "foo", a: [1, "2", null, true, { d: 90 }, new Date()] } };
  const s2c = _.cloneDeep(s2);
  const b2 = xmerge({}, s2);
  tap.match(s2, s2c, "original obj should remain intact");
  mutateObj(s2);
  // console.log("s2", JSON.stringify(s2, null, 2));
  // console.log("b2", JSON.stringify(b2, null, 2));
  test.match(b2, s2c);

  test.end();
});
