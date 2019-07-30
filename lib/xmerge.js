"use strict";

const assert = require("assert");

const XMERGE_SIG = "/~xmerge(";

const safeGet = (obj, key) => {
  return key === "__proto__" ? undefined : obj[key];
};

const typedArrayNames = {
  Int8Array: true,
  Uint8Array: true,
  Uint8ClampedArray: true,
  Int16Array: true,
  Uint16Array: true,
  Int32Array: true,
  Uint32Array: true,
  Float32Array: true,
  Float64Array: true
};

const isTypedArray = x => {
  return typedArrayNames[x && x.constructor.name] || false;
};

const ALLOW_OPS = {
  add: true,
  ascend: true,
  descend: true,
  arrayify: true,
  start: true,
  end: true,
  stringify: true,
  "if-not-exist": true,
  del: true,
  xmerge: true,
  uniq: true
};

function cloneBuffer(buf) {
  const x = Buffer.alloc ? Buffer.alloc(buf.length) : new Buffer(val.length);
  val.copy(x);
  return x;
}

function cloneSpecificValue(val) {
  if (Buffer.isBuffer(val)) {
    return cloneBuffer(val);
  } else if (val instanceof Date) {
    return new Date(val.getTime());
  } else if (val instanceof RegExp) {
    return new RegExp(val);
  }

  return undefined;
}

/**
 * Recursive cloning array.
 */
function deepCloneArray(arr) {
  let clone = [];
  let specificVal;
  for (let index = 0; index < arr.length; index++) {
    const item = arr[index];
    if (typeof item === "object" && item !== null) {
      if (Array.isArray(item)) {
        clone[index] = deepCloneArray(item);
      } else if ((specificVal = cloneSpecificValue(item))) {
        clone[index] = specificVal;
      } else {
        clone[index] = _xmerge({}, item);
      }
    } else {
      clone[index] = item;
    }
  }
  return clone;
}

const getXmergeOps = (str, xmIx) => {
  const o = str.substring(xmIx + XMERGE_SIG.length);
  const ops = o
    .substring(0, o.indexOf(")"))
    .split(" ")
    .filter(x => {
      if (x) {
        assert(ALLOW_OPS.hasOwnProperty(x), `key ${str} has invalid op ${x}`);
        return true;
      }
      return false;
    });
  return ops.length > 0 ? ops : undefined;
};

function _xmerge(dest, src) {
  for (const k in src) {
    let realKey = k;

    let xmOps = [];
    const xmIx = k.indexOf(XMERGE_SIG);
    if (xmIx >= 0) {
      realKey = k.substring(0, xmIx);
      xmOps = getXmergeOps(k, xmIx);
    }

    const cmd = xmOps && xmOps[0];
    // handle del and if-not-exist attr
    if (cmd && dest.hasOwnProperty(realKey)) {
      if (xmOps.indexOf("if-not-exist") > 0) continue;
      if (cmd === "del") {
        if (dest.hasOwnProperty(realKey)) {
          delete dest[realKey];
        }
        continue;
      }
    }

    const srcVal = safeGet(src, k);

    // avoid merging into self
    if (srcVal === dest) continue;
    // ignore undefined src val
    if (srcVal === undefined) continue;

    const destVal = safeGet(dest, realKey);

    // arrayify and stringify ops

    const arrayify = xmOps.indexOf("arrayify") >= 0;
    const stringify = !arrayify && xmOps.indexOf("stringify") >= 0;

    let isArr = Array.isArray(srcVal);
    let isStr = !isArr && typeof srcVal === "string";

    if (arrayify) {
      if (!isArr) {
        srcVal = [srcVal];
        isArr = true;
      }
    } else if (stringify) {
      if (!isStr) {
        srcVal = "" + srcVal;
        isStr = true;
      }
    }

    const isBuff = !isArr && Buffer.isBuffer(srcVal);
    const isTyped = !isArr && !isBuff && isTypedArray(srcVal);

    if (isArr) {
      if (cmd === "add") {
      } else {
        dest[realKey] = deepCloneArray(srcVal);
      }
    } else if (isBuff) {
      // handle buffer
      // TODO: accept option to avoid clone buffer
      dest[realKey] = cloneBuffer(srcVal);
    } else if (isTyped) {
      // handle typed array
      dest[realKey] = srcVal; // TODO: clone
    } else if (isStr) {
      // handle string
      dest[realKey] = srcVal;
    } else if (srcVal === null || typeof srcVal !== "object") {
      dest[realKey] = srcVal;
    } else if (typeof destVal !== "object" || destVal === null || Array.isArray(destVal)) {
      // recursively xmerge object as a new value
      dest[realKey] = _xmerge({}, srcVal);
    }

    // TODO: handle functions
    //  else if (typeof srcVal === "function") {
    // }
  }

  return dest;
}

function xmerge(...args) {
  const dest = Object(args[0]);

  for (let ix = 1; ix < args.length; ix++) {
    const src = args[ix];
    if (src && typeof src === "object" && !Array.isArray(src)) {
      _xmerge(dest, src);
    }
  }

  return dest;
}

module.exports = xmerge;

const opts = {
  function: "replace|clone|pre-chain|post-chain"
};
