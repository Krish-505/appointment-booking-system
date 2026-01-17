import jwt from "jsonwebtoken";
import {
  createUser,
  validateUser
} from "../services/user.service.js";

import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;


export default async function authRoutes(fastify) {

  // REGISTER
  fastify.post("/register", async (req, reply) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return reply.code(400).send({ error: "Username and password required" });
      }

      const user = await createUser(username, password);
      return reply.code(201).send(user);

    } catch (err) {
      return reply.code(409).send({ error: "User already exists" });
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
