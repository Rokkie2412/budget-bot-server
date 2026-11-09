import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import { ENC_ALGORITHM } from "../constants/index.js";

const VERSION_PREFIX = 'enc:v1';
const AES_KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 32;

const getKeys = (): { encryptionKey: Buffer; authenticationKey: Buffer } => {
  const configuredKey = process.env.ENCRYPTION_KEY;
  if (!configuredKey) {
    throw new Error('ENCRYPTION_KEY is not configured.');
  }

  const masterKey = Buffer.from(configuredKey, 'utf8');
  if (masterKey.length < AES_KEY_LENGTH) {
    throw new Error('ENCRYPTION_KEY must contain at least 32 bytes.');
  }

  const derivedKeys = Buffer.from(
    hkdfSync(
      'sha256',
      masterKey,
      Buffer.alloc(0),
      Buffer.from('transaction-description-encryption-v1'),
      AES_KEY_LENGTH * 2,
    ),
  );

  return {
    encryptionKey: derivedKeys.subarray(0, AES_KEY_LENGTH),
    authenticationKey: derivedKeys.subarray(AES_KEY_LENGTH),
  };
};

/**
 * Encrypts a transaction description using the same scheme as budget-tracker-pwa
 * so both apps can read each other's data.
 */
export const encrypt = (text: string): string => {
  const { encryptionKey, authenticationKey } = getKeys();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ENC_ALGORITHM, encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const encodedIv = iv.toString('base64');
  const encodedCiphertext = encrypted.toString('base64');
  const authenticatedValue = `${VERSION_PREFIX}:${encodedIv}:${encodedCiphertext}`;
  const authenticationTag = createHmac('sha256', authenticationKey)
    .update(authenticatedValue)
    .digest('base64');

  return `${authenticatedValue}:${authenticationTag}`;
};

const decodeBase64 = (value: string): Buffer => {
  const decoded = Buffer.from(value, 'base64');
  if (decoded.toString('base64') !== value) {
    throw new Error('Encrypted transaction description has an invalid format.');
  }
  return decoded;
};

export const decrypt = (text: string): string => {
  if (!text.startsWith(`${VERSION_PREFIX}:`)) return text;

  const parts = text.split(':');
  if (parts.length !== 5 || parts[0] !== 'enc' || parts[1] !== 'v1') {
    throw new Error('Encrypted transaction description has an invalid format.');
  }

  const [, , encodedIv, encodedCiphertext, encodedTag] = parts;
  const iv = decodeBase64(encodedIv!);
  const encrypted = decodeBase64(encodedCiphertext!);
  const authenticationTag = decodeBase64(encodedTag!);
  if (
    iv.length !== IV_LENGTH ||
    encrypted.length === 0 ||
    encrypted.length % IV_LENGTH !== 0 ||
    authenticationTag.length !== AUTH_TAG_LENGTH
  ) {
    throw new Error('Encrypted transaction description has an invalid format.');
  }

  const { encryptionKey, authenticationKey } = getKeys();
  const authenticatedValue = `${VERSION_PREFIX}:${encodedIv}:${encodedCiphertext}`;
  const expectedTag = createHmac('sha256', authenticationKey)
    .update(authenticatedValue)
    .digest();
  if (!timingSafeEqual(authenticationTag, expectedTag)) {
    throw new Error('Transaction description could not be authenticated.');
  }

  const decipher = createDecipheriv(ENC_ALGORITHM, encryptionKey, iv);
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString('utf8');
};
