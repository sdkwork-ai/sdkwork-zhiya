export function cx(...values: readonly (string | false | null | undefined)[]): string {
  return values.filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ');
}

export function trimPrice(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(value * 10 % 1 === 0 ? 1 : 2);
}
