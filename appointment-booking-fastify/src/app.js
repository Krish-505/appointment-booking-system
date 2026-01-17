import Fastify from "fastify";
import cors from "@fastify/cors";

import authRoutes from "./routes/auth.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";

const app = Fastify({ logger: true });

/* ---------------- CORS ---------------- */
await app.register(cors, {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
});

/* ---------------- ROUTES ---------------- */
await app.register(authRoutes, { prefix: "/auth" });
await app.register(appointmentRoutes, { prefix: "/appointments" });

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", async () => {
  return { status: "API running" };
});
app.setErrorHandler((error, req, reply) => {
  app.log.error(error);
  reply.code(500).send({ error: "Internal Server Error" });
});


export default app;
