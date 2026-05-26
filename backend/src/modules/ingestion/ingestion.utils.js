export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeNullableString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeInteger(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizePositiveNumber(value) {
  const number = normalizeInteger(value);

  if (number === null || number <= 0) {
    return null;
  }

  return number;
}

function toAnnualEuros(value) {
  const number = normalizePositiveNumber(value);

  if (number === null) {
    return null;
  }

  return number < 1000 ? Math.round(number * 1000) : number;
}

export function normalizeSalaryRange(salary) {
  if (!salary || typeof salary !== "object") {
    return {
      min: null,
      max: null,
    };
  }

  const rawMin = normalizePositiveNumber(salary.min);
  const rawMax = normalizePositiveNumber(salary.max);
  const rawMaxPerYear = normalizePositiveNumber(salary.maxPerYear);
  const recurrence = normalizeNullableString(salary.recurrence)?.toLowerCase();

  if (recurrence === "day") {
    const annualMax = toAnnualEuros(rawMaxPerYear);
    const annualMin =
      annualMax !== null && rawMin !== null && rawMax !== null
        ? Math.round((rawMin / rawMax) * annualMax)
        : null;

    return {
      min: annualMin,
      max: annualMax,
    };
  }

  if (recurrence === "year") {
    return {
      min: toAnnualEuros(rawMin),
      max: toAnnualEuros(rawMax ?? rawMaxPerYear),
    };
  }

  if (rawMaxPerYear !== null) {
    const annualMax = toAnnualEuros(rawMaxPerYear);
    const annualMin =
      annualMax !== null && rawMin !== null && rawMax !== null
        ? Math.round((rawMin / rawMax) * annualMax)
        : toAnnualEuros(rawMin);

    return {
      min: annualMin,
      max: annualMax,
    };
  }

  return {
    min: toAnnualEuros(rawMin),
    max: toAnnualEuros(rawMax),
  };
}

export function toDateFromWeloveDevsTimestamp(value) {
  if (!value) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  if (Math.abs(number) > 1e14) {
    return new Date(number / 1000);
  }

  if (Math.abs(number) > 1e11) {
    return new Date(number);
  }

  return new Date(number * 1000);
}
