// src/utils/validators.ts

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

/**
 * Normalize benefit start age selection
 * @param currentAge Current age of the person
 * @param isCollecting Whether benefits are currently being collected
 * @param startAge Selected start age
 * @param minAge Minimum allowed start age
 * @param maxAge Maximum allowed start age
 * @returns Normalized start age or undefined
 */
export const normalizeBenefitStartAge = (
  currentAge: number, 
  isCollecting: boolean, 
  startAge?: number | string,
  minAge: number = 60,
  maxAge: number = 70
): number | undefined => {
  // If currently collecting, return current age
  if (isCollecting) {
    return currentAge;
  }

  // If do not qualify or invalid selection, return undefined
  if (startAge === 'do-not-qualify' || startAge === undefined) {
    return undefined;
  }

  // If it's a number, validate it
  if (typeof startAge === 'number') {
    // Ensure age is within allowed range
    return Math.max(minAge, Math.min(maxAge, startAge));
  }

  // Default to standard age if nothing else matches
  return minAge === 60 ? 65 : minAge;
};