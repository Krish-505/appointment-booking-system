import jwt from "jsonwebtoken";

const JWT_SECRET = "super_secret_key"; // later move to .env
const JWT_EXPIRES_IN = "1h";

/**
 * Generate JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
