import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const HASH_ALGORITHM = "scrypt";
const HASH_KEY_LENGTH = 64;

export function hashPasswordForStorage(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, HASH_KEY_LENGTH).toString("hex");
  return `${HASH_ALGORITHM}$${salt}$${derivedKey}`;
}

export function verifyStoredPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split("$");

  if (algorithm !== HASH_ALGORITHM || !salt || !hash) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, HASH_KEY_LENGTH);
  const storedKey = Buffer.from(hash, "hex");

  if (derivedKey.length !== storedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedKey);
}
