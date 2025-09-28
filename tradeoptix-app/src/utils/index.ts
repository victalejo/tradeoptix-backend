/**
 * Utility functions for safe array handling and other common operations
 */

/**
 * Ensures a value is always an array, never null or undefined
 * @param value - The value to check
 * @returns An array, empty if the input was null/undefined/not an array
 */
export function ensureArray<T>(value: T[] | null | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
}

/**
 * Safe array length check that handles null/undefined
 * @param arr - The array to check
 * @returns The length of the array, or 0 if null/undefined
 */
export function safeArrayLength(arr: any[] | null | undefined): number {
  return Array.isArray(arr) ? arr.length : 0;
}

/**
 * Safe array find that handles null/undefined arrays
 * @param arr - The array to search
 * @param predicate - The search function
 * @returns The found item or null
 */
export function safeArrayFind<T>(
  arr: T[] | null | undefined,
  predicate: (item: T) => boolean
): T | null {
  if (!Array.isArray(arr)) return null;
  const found = arr.find(predicate);
  return found || null;
}

/**
 * Safe array map that handles null/undefined arrays
 * @param arr - The array to map
 * @param mapper - The mapping function
 * @returns The mapped array or empty array
 */
export function safeArrayMap<T, U>(
  arr: T[] | null | undefined,
  mapper: (item: T) => U
): U[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(mapper);
}

/**
 * Safe array filter that handles null/undefined arrays
 * @param arr - The array to filter
 * @param predicate - The filter function
 * @returns The filtered array or empty array
 */
export function safeArrayFilter<T>(
  arr: T[] | null | undefined,
  predicate: (item: T) => boolean
): T[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter(predicate);
}

/**
 * Safe array every that handles null/undefined arrays
 * @param arr - The array to check
 * @param predicate - The test function
 * @returns true if all elements pass the test, false if array is null/undefined or any element fails
 */
export function safeArrayEvery<T>(
  arr: T[] | null | undefined,
  predicate: (item: T) => boolean
): boolean {
  if (!Array.isArray(arr)) return false;
  return arr.every(predicate);
}

/**
 * Safe array some that handles null/undefined arrays
 * @param arr - The array to check
 * @param predicate - The test function
 * @returns true if any element passes the test, false if array is null/undefined or no element passes
 */
export function safeArraySome<T>(
  arr: T[] | null | undefined,
  predicate: (item: T) => boolean
): boolean {
  if (!Array.isArray(arr)) return false;
  return arr.some(predicate);
}

/**
 * Safe JSON parse that handles errors gracefully
 * @param jsonString - The JSON string to parse
 * @param fallback - The fallback value if parsing fails
 * @returns The parsed object or fallback value
 */
export function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
}

/**
 * Checks if a value is not null and not undefined
 * @param value - The value to check
 * @returns true if value is not null and not undefined
 */
export function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Safe string length check
 * @param str - The string to check
 * @returns The length of the string, or 0 if null/undefined
 */
export function safeStringLength(str: string | null | undefined): number {
  return typeof str === 'string' ? str.length : 0;
}