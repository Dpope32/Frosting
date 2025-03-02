/**
 * ZIP code validation utility
 */

/**
 * Result of ZIP code validation
 */
export interface ZipValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates if a string is a valid US ZIP code format (5 digits)
 */
export function isValidZipFormat(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

/**
 * Validates if a ZIP code exists in the US
 * This is a basic validation that checks if the ZIP code is within valid ranges
 * For a more comprehensive validation, a complete database of valid ZIP codes would be needed
 */
export function isValidZipRange(zip: string): boolean {
  const zipNum = parseInt(zip, 10);
  
  // Check if ZIP is within valid US ranges
  // This is a simplified check - not all numbers in these ranges are valid ZIP codes
  return (
    // Continental US ranges
    (zipNum >= 1001 && zipNum <= 99950) &&
    // Exclude invalid ranges
    !(zipNum >= 56900 && zipNum <= 56999) && // Not assigned
    !(zipNum >= 96200 && zipNum <= 96899) && // Not assigned
    !(zipNum >= 97000 && zipNum <= 97999)    // Not assigned
  );
}

/**
 * Validates a ZIP code
 * @param zip The ZIP code to validate
 * @returns Validation result with status and message
 */
export function validateZipCode(zip: string | null | undefined): ZipValidationResult {
  // Check if ZIP is empty
  if (!zip) {
    return { 
      isValid: false, 
      message: 'Please enter a ZIP code' 
    };
  }
  
  // Check format (5 digits)
  if (!isValidZipFormat(zip)) {
    return { 
      isValid: false, 
      message: 'ZIP code must be 5 digits' 
    };
  }
  
  // Check if in valid US ZIP range
  if (!isValidZipRange(zip)) {
    return { 
      isValid: false, 
      message: 'Not a valid US ZIP code' 
    };
  }
  
  // All checks passed
  return { isValid: true };
}

/**
 * List of fallback ZIP codes for major US cities
 * Used when a user skips entering their ZIP or enters an invalid one
 */
export const FALLBACK_ZIP_CODES = {
  DALLAS: "75201",    // Dallas, TX
  NEW_YORK: "10001",  // New York, NY
  LOS_ANGELES: "90001", // Los Angeles, CA
  CHICAGO: "60601",   // Chicago, IL
  HOUSTON: "77001",   // Houston, TX
  DEFAULT: "75201"    // Default (Dallas)
};
