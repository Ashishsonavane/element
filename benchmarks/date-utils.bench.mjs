import { bench, describe } from "vitest";

// Inline implementations from src/utils/date-util.js
// These are pure functions that don't require locale or external modules

const isDate = function (date) {
  if (date === null || date === undefined) return false;
  if (isNaN(new Date(date).getTime())) return false;
  if (Array.isArray(date)) return false;
  return true;
};

const isDateObject = function (val) {
  return val instanceof Date;
};

const getDayCountOfMonth = function (year, month) {
  if (isNaN(+month)) return 31;
  return new Date(year, +month + 1, 0).getDate();
};

const getDayCountOfYear = function (year) {
  const isLeapYear = year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  return isLeapYear ? 366 : 365;
};

const getFirstDayOfMonth = function (date) {
  const temp = new Date(date.getTime());
  temp.setDate(1);
  return temp.getDay();
};

const prevDate = function (date, amount = 1) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - amount
  );
};

const nextDate = function (date, amount = 1) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + amount
  );
};

const getStartDateOfMonth = function (year, month) {
  const result = new Date(year, month, 1);
  const day = result.getDay();
  if (day === 0) {
    return prevDate(result, 7);
  } else {
    return prevDate(result, day);
  }
};

const getWeekNumber = function (src) {
  if (!isDate(src)) return null;
  const date = new Date(src.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
};

const range = function (n) {
  return Array.apply(null, { length: n }).map((_, n) => n);
};

const modifyDate = function (date, y, m, d) {
  return new Date(
    y,
    m,
    d,
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
};

const modifyTime = function (date, h, m, s) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    h,
    m,
    s,
    date.getMilliseconds()
  );
};

const clearTime = function (date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const clearMilliseconds = function (date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    0
  );
};

const changeYearMonthAndClampDate = function (date, year, month) {
  const monthDate = Math.min(date.getDate(), getDayCountOfMonth(year, month));
  return modifyDate(date, year, month, monthDate);
};

const prevMonth = function (date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return month === 0
    ? changeYearMonthAndClampDate(date, year - 1, 11)
    : changeYearMonthAndClampDate(date, year, month - 1);
};

const nextMonth = function (date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return month === 11
    ? changeYearMonthAndClampDate(date, year + 1, 0)
    : changeYearMonthAndClampDate(date, year, month + 1);
};

const extractDateFormat = function (format) {
  return format
    .replace(/\W?m{1,2}|\W?ZZ/g, "")
    .replace(/\W?h{1,2}|\W?s{1,3}|\W?a/gi, "")
    .trim();
};

const extractTimeFormat = function (format) {
  return format
    .replace(/\W?D{1,2}|\W?Do|\W?d{1,4}|\W?M{1,4}|\W?y{2,4}/g, "")
    .trim();
};

const validateRangeInOneMonth = function (start, end) {
  return (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  );
};

// Test data
const now = new Date(2024, 5, 15, 12, 30, 45, 123);
const jan31 = new Date(2024, 0, 31);
const dec31 = new Date(2024, 11, 31);

describe("isDate", () => {
  bench("valid date object", () => {
    isDate(now);
  });
  bench("valid date string", () => {
    isDate("2024-06-15");
  });
  bench("null", () => {
    isDate(null);
  });
  bench("array", () => {
    isDate([2024, 6, 15]);
  });
});

describe("getDayCountOfMonth", () => {
  bench("31-day month", () => {
    getDayCountOfMonth(2024, 0);
  });
  bench("February leap year", () => {
    getDayCountOfMonth(2024, 1);
  });
  bench("February non-leap year", () => {
    getDayCountOfMonth(2023, 1);
  });
  bench("30-day month", () => {
    getDayCountOfMonth(2024, 3);
  });
});

describe("getDayCountOfYear", () => {
  bench("leap year", () => {
    getDayCountOfYear(2024);
  });
  bench("non-leap year", () => {
    getDayCountOfYear(2023);
  });
  bench("century non-leap year", () => {
    getDayCountOfYear(1900);
  });
  bench("400-year leap year", () => {
    getDayCountOfYear(2000);
  });
});

describe("getFirstDayOfMonth", () => {
  bench("get first day", () => {
    getFirstDayOfMonth(now);
  });
});

describe("date navigation", () => {
  bench("prevDate", () => {
    prevDate(now);
  });
  bench("nextDate", () => {
    nextDate(now);
  });
  bench("prevDate with amount", () => {
    prevDate(now, 7);
  });
  bench("nextDate with amount", () => {
    nextDate(now, 30);
  });
});

describe("getStartDateOfMonth", () => {
  bench("get start date", () => {
    getStartDateOfMonth(2024, 5);
  });
  bench("month starting on Sunday", () => {
    getStartDateOfMonth(2024, 8);
  });
});

describe("getWeekNumber", () => {
  bench("mid-year date", () => {
    getWeekNumber(now);
  });
  bench("start of year", () => {
    getWeekNumber(new Date(2024, 0, 1));
  });
  bench("end of year", () => {
    getWeekNumber(dec31);
  });
});

describe("range", () => {
  bench("small range (10)", () => {
    range(10);
  });
  bench("medium range (100)", () => {
    range(100);
  });
  bench("large range (1000)", () => {
    range(1000);
  });
});

describe("date modification", () => {
  bench("modifyDate", () => {
    modifyDate(now, 2025, 0, 1);
  });
  bench("modifyTime", () => {
    modifyTime(now, 8, 0, 0);
  });
  bench("clearTime", () => {
    clearTime(now);
  });
  bench("clearMilliseconds", () => {
    clearMilliseconds(now);
  });
});

describe("month navigation", () => {
  bench("prevMonth (regular)", () => {
    prevMonth(now);
  });
  bench("prevMonth (January to December)", () => {
    prevMonth(jan31);
  });
  bench("nextMonth (regular)", () => {
    nextMonth(now);
  });
  bench("nextMonth (December to January)", () => {
    nextMonth(dec31);
  });
  bench("nextMonth with date clamping (Jan 31 -> Feb 28/29)", () => {
    nextMonth(jan31);
  });
});

describe("format extraction", () => {
  bench("extractDateFormat", () => {
    extractDateFormat("yyyy-MM-dd HH:mm:ss");
  });
  bench("extractTimeFormat", () => {
    extractTimeFormat("yyyy-MM-dd HH:mm:ss");
  });
});

describe("validateRangeInOneMonth", () => {
  bench("same month", () => {
    validateRangeInOneMonth(
      new Date(2024, 5, 1),
      new Date(2024, 5, 30)
    );
  });
  bench("different months", () => {
    validateRangeInOneMonth(
      new Date(2024, 5, 1),
      new Date(2024, 6, 15)
    );
  });
});
