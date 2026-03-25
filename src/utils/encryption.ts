import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import { ENC_ALGORITHM } from '../constants'

export const hashUserId = (userId: string): string => {
  return bcrypt.hashSync(userId, process.env.STATIC_SALT);
};

export const compareUserId = (rawId: string, hashedId: string): boolean => {
  return bcrypt.compareSync(rawId, hashedId);
};

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENC_ALGORITHM, Buffer.from(process.env.ENCRYPTION_KEY!), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
};

export const decrypt = (text: string): string => {
  try {
    const [ivHex, encryptedText] = text.split(':');
    if (!ivHex || !encryptedText) return text;

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ENC_ALGORITHM, Buffer.from(process.env.ENCRYPTION_KEY!), iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    return "[Data Protected]";
  }
};
