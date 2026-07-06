import { randomBytes } from 'crypto';

export function generateToken(prefix: string): string {
  return `${prefix}_${randomBytes(32).toString('base64url')}`;
}
