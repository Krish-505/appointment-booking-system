import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;


export function authMiddleware(req, reply, done) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return reply.code(401).send({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, username }
    done();
  } catch (err) {
    return reply.code(401).send({ error: "Invalid token" });
  }
}
