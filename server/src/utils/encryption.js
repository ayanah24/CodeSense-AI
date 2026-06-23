import crypto from 'crypto';

const KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY, 'hex');
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  // Store as iv:encryptedData
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(text) {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}