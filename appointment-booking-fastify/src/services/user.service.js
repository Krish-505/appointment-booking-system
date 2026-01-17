import bcrypt from "bcrypt";
import db from "../config/db.js";

const SALT_ROUNDS = 10;

/**
 * Find user by username
 */
export async function findUserByUsername(username) {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  return rows[0];
}

/**
 * Create new user (with hashed password)
 */
export async function createUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const [result] = await db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword]
  );

  return {
    userId: result.insertId,
    username
  };
}

/**
 * Validate login credentials
 */
export async function validateUser(username, password) {
  const user = await findUserByUsername(username);
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  return {
    userId: user.id,
    username: user.username
  };
}
