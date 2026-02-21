import { bench, describe } from "vitest";

// Inline implementations of utility functions to avoid module resolution issues
// These are extracted from src/utils/util.js and src/utils/types.js

function isString(obj) {
  return Object.prototype.toString.call(obj) === "[object String]";
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

function extend(to, _from) {
  for (let key in _from) {
    to[key] = _from[key];
  }
  return to;
}

function toObject(arr) {
  var res = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res;
}

const getValueByPath = function (object, prop) {
  prop = prop || "";
  const paths = prop.split(".");
  let current = object;
  let result = null;
  for (let i = 0, j = paths.length; i < j; i++) {
    const path = paths[i];
    if (!current) break;
    if (i === j - 1) {
      result = current[path];
      break;
    }
    current = current[path];
  }
  return result;
};

function getPropByPath(obj, path, strict) {
  let tempObj = obj;
  path = path.replace(/\[(\w+)\]/g, ".$1");
  path = path.replace(/^\./, "");
  let keyArr = path.split(".");
  let i = 0;
  for (let len = keyArr.length; i < len - 1; ++i) {
    if (!tempObj && !strict) break;
    let key = keyArr[i];
    if (key in tempObj) {
      tempObj = tempObj[key];
    } else {
      if (strict) {
        throw new Error("please transfer a valid prop path to form item!");
      }
      break;
    }
  }
  return {
    o: tempObj,
    k: keyArr[i],
    v: tempObj ? tempObj[keyArr[i]] : null,
  };
}

const valueEquals = (a, b) => {
  if (a === b) return true;
  if (!(a instanceof Array)) return false;
  if (!(b instanceof Array)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i !== a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const escapeRegexpString = (value = "") =>
  String(value).replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");

const arrayFindIndex = function (arr, pred) {
  for (let i = 0; i !== arr.length; ++i) {
    if (pred(arr[i])) {
      return i;
    }
  }
  return -1;
};

const arrayFind = function (arr, pred) {
  const idx = arrayFindIndex(arr, pred);
  return idx !== -1 ? arr[idx] : undefined;
};

const coerceTruthyValueToArray = function (val) {
  if (Array.isArray(val)) {
    return val;
  } else if (val) {
    return [val];
  } else {
    return [];
  }
};

const autoprefixer = function (style) {
  if (typeof style !== "object") return style;
  const rules = ["transform", "transition", "animation"];
  const prefixes = ["ms-", "webkit-"];
  rules.forEach((rule) => {
    const value = style[rule];
    if (rule && value) {
      prefixes.forEach((prefix) => {
        style[prefix + rule] = value;
      });
    }
  });
  return style;
};

const kebabCase = function (str) {
  const hyphenateRE = /([^-])([A-Z])/g;
  return str
    .replace(hyphenateRE, "$1-$2")
    .replace(hyphenateRE, "$1-$2")
    .toLowerCase();
};

const capitalize = function (str) {
  if (!isString(str)) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const looseEqual = function (a, b) {
  const isObjectA = isObject(a);
  const isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    return JSON.stringify(a) === JSON.stringify(b);
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b);
  } else {
    return false;
  }
};

const arrayEquals = function (arrayA, arrayB) {
  arrayA = arrayA || [];
  arrayB = arrayB || [];
  if (arrayA.length !== arrayB.length) {
    return false;
  }
  for (let i = 0; i < arrayA.length; i++) {
    if (!looseEqual(arrayA[i], arrayB[i])) {
      return false;
    }
  }
  return true;
};

const isEqual = function (value1, value2) {
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return arrayEquals(value1, value2);
  }
  return looseEqual(value1, value2);
};

const isEmpty = function (val) {
  if (val == null) return true;
  if (typeof val === "boolean") return false;
  if (typeof val === "number") return !val;
  if (val instanceof Error) return val.message === "";
  switch (Object.prototype.toString.call(val)) {
    case "[object String]":
    case "[object Array]":
      return !val.length;
    case "[object File]":
    case "[object Map]":
    case "[object Set]":
      return !val.size;
    case "[object Object]":
      return !Object.keys(val).length;
  }
  return false;
};

function merge(target) {
  for (let i = 1, j = arguments.length; i < j; i++) {
    let source = arguments[i] || {};
    for (let prop in source) {
      if (source.hasOwnProperty(prop)) {
        let value = source[prop];
        if (value !== undefined) {
          target[prop] = value;
        }
      }
    }
  }
  return target;
}

// Test data
const nestedObject = {
  a: { b: { c: { d: { e: "deep value" } } } },
  x: { y: [1, 2, 3] },
  name: "test",
};

const largeArray = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  name: `item-${i}`,
}));

const sampleStyle = {
  transform: "translateX(10px)",
  transition: "all 0.3s ease",
  animation: "fadeIn 1s",
  color: "red",
  fontSize: "14px",
};

describe("hasOwn", () => {
  const obj = { a: 1, b: 2, c: 3 };
  bench("check existing property", () => {
    hasOwn(obj, "a");
  });
  bench("check non-existing property", () => {
    hasOwn(obj, "z");
  });
});

describe("toObject", () => {
  const arr = [{ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }];
  bench("merge array of objects", () => {
    toObject(arr);
  });
  bench("merge large array of objects", () => {
    toObject(largeArray);
  });
});

describe("getValueByPath", () => {
  bench("shallow path", () => {
    getValueByPath(nestedObject, "name");
  });
  bench("deep nested path", () => {
    getValueByPath(nestedObject, "a.b.c.d.e");
  });
});

describe("getPropByPath", () => {
  bench("simple path", () => {
    getPropByPath(nestedObject, "name");
  });
  bench("nested path", () => {
    getPropByPath(nestedObject, "a.b.c.d.e");
  });
  bench("array bracket notation", () => {
    getPropByPath({ items: [{ name: "test" }] }, "items[0].name");
  });
});

describe("valueEquals", () => {
  const arr1 = [1, 2, 3, 4, 5];
  const arr2 = [1, 2, 3, 4, 5];
  const arr3 = [1, 2, 3, 4, 6];
  bench("equal arrays", () => {
    valueEquals(arr1, arr2);
  });
  bench("unequal arrays", () => {
    valueEquals(arr1, arr3);
  });
});

describe("escapeRegexpString", () => {
  bench("string with special characters", () => {
    escapeRegexpString("hello.world[0]+(test)*?");
  });
  bench("plain string", () => {
    escapeRegexpString("hello world");
  });
});

describe("arrayFindIndex", () => {
  bench("find in small array", () => {
    arrayFindIndex([1, 2, 3, 4, 5], (x) => x === 3);
  });
  bench("find in large array", () => {
    arrayFindIndex(largeArray, (x) => x.id === 500);
  });
  bench("not found in large array", () => {
    arrayFindIndex(largeArray, (x) => x.id === -1);
  });
});

describe("arrayFind", () => {
  bench("find existing element", () => {
    arrayFind(largeArray, (x) => x.id === 500);
  });
  bench("find non-existing element", () => {
    arrayFind(largeArray, (x) => x.id === -1);
  });
});

describe("coerceTruthyValueToArray", () => {
  bench("array input", () => {
    coerceTruthyValueToArray([1, 2, 3]);
  });
  bench("truthy non-array", () => {
    coerceTruthyValueToArray("hello");
  });
  bench("falsy value", () => {
    coerceTruthyValueToArray(null);
  });
});

describe("autoprefixer", () => {
  bench("style with prefixable properties", () => {
    autoprefixer({ ...sampleStyle });
  });
  bench("style without prefixable properties", () => {
    autoprefixer({ color: "red", fontSize: "14px" });
  });
});

describe("kebabCase", () => {
  bench("camelCase string", () => {
    kebabCase("backgroundColor");
  });
  bench("PascalCase string", () => {
    kebabCase("MyComponentName");
  });
  bench("already kebab-case", () => {
    kebabCase("my-component");
  });
});

describe("capitalize", () => {
  bench("lowercase string", () => {
    capitalize("hello");
  });
  bench("already capitalized", () => {
    capitalize("Hello");
  });
});

describe("looseEqual", () => {
  bench("equal objects", () => {
    looseEqual({ a: 1, b: 2 }, { a: 1, b: 2 });
  });
  bench("unequal objects", () => {
    looseEqual({ a: 1 }, { a: 2 });
  });
  bench("equal primitives", () => {
    looseEqual("hello", "hello");
  });
});

describe("isEqual", () => {
  bench("equal arrays of objects", () => {
    isEqual(
      [{ a: 1 }, { b: 2 }],
      [{ a: 1 }, { b: 2 }]
    );
  });
  bench("equal primitives", () => {
    isEqual(42, 42);
  });
});

describe("isEmpty", () => {
  bench("null value", () => {
    isEmpty(null);
  });
  bench("empty string", () => {
    isEmpty("");
  });
  bench("empty array", () => {
    isEmpty([]);
  });
  bench("empty object", () => {
    isEmpty({});
  });
  bench("non-empty object", () => {
    isEmpty({ a: 1 });
  });
});

describe("merge", () => {
  bench("merge two objects", () => {
    merge({}, { a: 1, b: 2 }, { c: 3, d: 4 });
  });
  bench("merge with overlapping keys", () => {
    merge({}, { a: 1, b: 2 }, { a: 3, b: 4 });
  });
});

describe("type checks", () => {
  bench("isString with string", () => {
    isString("hello");
  });
  bench("isString with non-string", () => {
    isString(42);
  });
  bench("isObject with object", () => {
    isObject({ a: 1 });
  });
  bench("isObject with non-object", () => {
    isObject("hello");
  });
});
