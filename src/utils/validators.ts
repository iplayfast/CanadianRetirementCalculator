/**
 * Validate that a value is a positive number
 * @param value Value to validate
 * @returns True if valid, false otherwise
 */
export const isPositiveNumber = (value: any): boolean => {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Validate that a value is a positive integer
 * @param value Value to validate
 * @returns True if valid, false otherwise
 */
export const isPositiveInteger = (value: any): boolean => {
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num) && num >= 0;
};

/**
 * Validate that a value is within a range
 * @param value Value to validate
 * @param min Minimum value
 * @param max Maximum value
 * @returns True if valid, false otherwise
 */
export const isInRange = (value: any, min: number, max: number): boolean => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validate that a field is not empty
 * @param value Value to validate
 * @returns True if valid, false otherwise
 */
export const isNotEmpty = (value: any): boolean => {
  return value !== null && value !== undefined && value !== '';
};
