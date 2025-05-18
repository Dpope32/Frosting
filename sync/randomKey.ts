// sync/randomKey.ts
// Purpose: generate a random key for the device.

/**
 * Generates a pseudo-random 32-byte key using pure JavaScript.
 * This function completely avoids native crypto modules to ensure cross-platform compatibility.
 */
export const generateRandomKey = (): string => {
    // Create a hex string directly without relying on WordArray.create which might use native crypto
    let hexString = '';
    const characters = '0123456789abcdef';
    
    // Generate 64 hex characters (32 bytes)
    for (let i = 0; i < 64; i++) {
      hexString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return hexString;
  };