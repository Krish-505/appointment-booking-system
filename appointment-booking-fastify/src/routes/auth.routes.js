import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByUsername,
  validateUser
} from "../services/user.service.js";

import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;


export default async function authRoutes(fastify) {

  // REGISTER
fastify.post("/auth/register", async (req, reply) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return reply.code(400).send({
        error: "Username and password are required"
      });
    }

    if (password.length < 4) {
      return reply.code(400).send({
        error: "Password must be at least 4 characters"
      });
    }

    // Check if user already exists
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return reply.code(409).send({
        error: "Username already exists"
      });
    }

    // Create user
    const newUser = await createUser(username, password);

    return reply.code(201).send({
      message: "User registered successfully",
      user: newUser
    });

  } catch (err) {
    console.error(err);
    return reply.code(500).send({
      error: "Server error"
    });
  }
});


  // LOGIN
  fastify.post("/login", async (req, reply) => {
    try {
      const { username, password } = req.body;

      const user = await validateUser(username, password);

      if (!user) {
        return reply.code(401).send({ error: "Login failed" });
      }

      const token = jwt.sign(user, JWT_SECRET, {
        expiresIn: "1h"
      });

      return reply.send({ user, token });

    } catch (err) {
      console.error(err);
      return reply.code(500).send({ error: "Server error" });
    }
  });
}
