import app from "./app.js";
import { expireAppointments } from "./services/appointment.service.js";
import "dotenv/config";

const PORT = process.env.PORT || 3000;

app.listen({ port: PORT }, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

/* AUTO-EXPIRE JOB */
setInterval(async () => {
  try {
    await expireAppointments();
    console.log("⏰ Expired appointments updated");
  } catch (err) {
    console.error("Expire job failed", err);
  }
}, 10000); // every 10 seconds 
