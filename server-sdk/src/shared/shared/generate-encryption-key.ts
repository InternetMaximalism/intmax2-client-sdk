import { sha256 } from 'viem';

import { hexToUint8Array } from '../utils';

const TIME_COST = 100000;
const DERIVED_KEY_LENGTH_BITS = 256; // 32 bytes (256 bits) for AES-256

const deriveKey = async (password: Uint8Array<ArrayBufferLike>, salt: Uint8Array<ArrayBuffer>, iterations: number) => {
  // Import the hashed password as a key
  const baseKey = await crypto.subtle.importKey('raw', password, { name: 'PBKDF2' }, false, ['deriveBits']);

  // Derive the final key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    baseKey,
    DERIVED_KEY_LENGTH_BITS,
  );

  return new Uint8Array(derivedBits);
};

/**
 * Derives a cryptographic key from input bytes and a nonce
 * @param messageBytes - The input bytes to derive a key from
 * @param nonce - A number to use as part of the salt
 * @returns A Uint8Array containing the derived key
 */
export const generateEncryptionKey = async (messageHex: `0x${string}`, nonce: number): Promise<Uint8Array> => {
  try {
    const passwordHash = sha256(messageHex);
    const passwordHashBytes = hexToUint8Array(passwordHash);

    // Create a salt using the nonce
    // Using a fixed salt reduces security by making derived keys predictable.
    // This is an intentional design choice to guarantee that the same key will be
    // derived whenever the same nonce is used.
    const nonceBuf = new Uint8Array(new Uint32Array([nonce]).buffer);

    // Combine the salt with a fixed string to make it longer
    const FIXED_SALT = ':PBKDF2-salt';
    const combinedSalt = new Uint8Array(16);
    combinedSalt.set(nonceBuf);
    combinedSalt.set(new TextEncoder().encode(FIXED_SALT), nonceBuf.byteLength);

    return await deriveKey(passwordHashBytes, combinedSalt, TIME_COST);
  } catch (error) {
    console.error('Error deriving key:', error);
    throw error;
  }
};
