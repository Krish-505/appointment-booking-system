import db from "../config/db.js";

/**
 * CREATE appointment
 * - No past appointments
 * - No double booking (same user, same time)
 */
export async function createAppointment({
  userId,
  personName,
  title,
  appointmentDateTime
}) {
  // Prevent past appointment
  const now = new Date();
  const apptTime = new Date(appointmentDateTime);

  if (apptTime <= now) {
    throw new Error("Cannot create appointment in the past");
  }

  // Double booking check
  const [conflict] = await db.query(
    `SELECT id FROM appointments
     WHERE user_id = ?
       AND appointment_datetime = ?
       AND status = 'ACTIVE'`,
    [userId, appointmentDateTime]
  );

  if (conflict.length > 0) {
    throw new Error("You already have an appointment at this time");
  }

  // Insert appointment
  const [result] = await db.query(
    `INSERT INTO appointments
     (user_id, person_name, title, appointment_datetime)
     VALUES (?, ?, ?, ?)`,
    [userId, personName, title, appointmentDateTime]
  );

  // Return full object (frontend expects this)
  const [rows] = await db.query(
    `SELECT * FROM appointments WHERE id = ?`,
    [result.insertId]
  );

  return rows[0];
}

/**
 * GET appointments for user
 * - Auto-expire before returning
 * - Newest first
 */
export async function getAppointmentsByUser(userId) {
  const [rows] = await db.query(
    `
    SELECT
      id,
      person_name AS personName,
      title,
      appointment_datetime,
      status
    FROM appointments
    WHERE user_id = ?
    ORDER BY appointment_datetime DESC
    `,
    [userId]
  );

  return rows;
}


/**
 * UPDATE appointment
 * - Cannot move to past
 * - Cannot double book
 * - Only owner can update
 */
export async function updateAppointment(id, userId, updates) {
  const { title, appointmentDateTime } = updates;

  const newTime = new Date(appointmentDateTime);
  if (newTime <= new Date()) {
    throw new Error("Cannot update appointment to past time");
  }

  // Double booking check (exclude current appointment)
  const [conflict] = await db.query(
    `SELECT id FROM appointments
     WHERE user_id = ?
       AND appointment_datetime = ?
       AND status = 'ACTIVE'
       AND id != ?`,
    [userId, appointmentDateTime, id]
  );

  if (conflict.length > 0) {
    throw new Error("This time slot is already booked");
  }

  const [result] = await db.query(
    `UPDATE appointments
     SET title = ?, appointment_datetime = ?
     WHERE id = ? AND user_id = ?`,
    [title, appointmentDateTime, id, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Appointment not found or unauthorized");
  }
}

/**
 * DELETE appointment
 * - Only owner can delete
 */
export async function deleteAppointment(id, userId) {
  const [result] = await db.query(
    "DELETE FROM appointments WHERE id = ? AND user_id = ?",
    [id, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Appointment not found or not authorized");
  }
}


/* AUTO EXPIRE APPOINTMENTS */
export async function expireAppointments() {
  await db.query(`
    UPDATE appointments
    SET status = 'EXPIRED'
    WHERE appointment_datetime < NOW()
    AND status = 'ACTIVE'
  `);
}