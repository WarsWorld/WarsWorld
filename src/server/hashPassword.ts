import { genSalt, hash } from "bcrypt";

const SALT_ROUNDS = 12;

export default async function hashPassword(password: string) {
  const salt = await genSalt(SALT_ROUNDS);
  const hashedPassword = await hash(password, salt);

  return hashedPassword;
}
