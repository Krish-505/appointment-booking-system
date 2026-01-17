import {
  createAppointment,
  getAppointmentsByUser,
  updateAppointment,
  deleteAppointment
} from "../services/appointment.service.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

export default async function appointmentRoutes(fastify) {

  /**
   * GET all appointments for logged-in user
   */
  fastify.get(
    "/",
    { preHandler: authMiddleware },
    async (req, reply) => {
      const userId = req.user.userId; //  from JWT

      const appointments = await getAppointmentsByUser(userId);
      return appointments;
    }
  );

  /**
   * CREATE appointment
   */
  fastify.post(
    "/",
    { preHandler: authMiddleware },
    async (req, reply) => {
      try {
        const userId = req.user.userId; //  from JWT
        const { personName, title, date, time } = req.body;

        if (!personName || !title || !date || !time) {
          return reply.code(400).send({
            error: "All fields are required"
          });
        }

        const appointmentDateTime = `${date} ${time}:00`;

        const appointment = await createAppointment({
          userId,
          personName,
          title,
          appointmentDateTime
        });

        reply.code(201).send(appointment);
      } catch (err) {
        reply.code(400).send({ error: err.message });
      }
    }
  );

  /**
   * UPDATE appointment
   */
  fastify.put(
    "/:id",
    { preHandler: authMiddleware },
    async (req, reply) => {
      try {
        const userId = req.user.userId; //  from JWT
        const { id } = req.params;
        const { title, date, time } = req.body;

        if (!title || !date || !time) {
          return reply.code(400).send({
            error: "All fields are required"
          });
        }

        const appointmentDateTime = `${date} ${time}:00`;

        await updateAppointment(id, userId, {
          title,
          appointmentDateTime
        });

        reply.send({ success: true });
      } catch (err) {
        reply.code(400).send({ error: err.message });
      }
    }
  );

  /**
   * DELETE appointment
   */
  fastify.delete(
    "/:id",
    { preHandler: authMiddleware },
    async (req, reply) => {
      try {
        const userId = req.user.userId;
        const id = Number(req.params.id);

        await deleteAppointment(id, userId);

        return reply.send({ success: true });
      } catch (err) {
        return reply.code(403).send({
          error: err.message || "Delete not allowed"
        });
      }
    }
  );

}
