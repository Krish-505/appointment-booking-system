import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFilePath = path.join(__dirname, "../data/appointments.json");

async function readAppointments() {
  try {
    const data = await fs.readFile(dataFilePath, "utf-8");
    const appointments = JSON.parse(data);

    //SORT
    return appointments.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch {
    return [];
  }
}


async function writeAppointments(appointments) {
  await fs.writeFile(
    dataFilePath,
    JSON.stringify(appointments, null, 2),
    "utf-8"
  );
}

export {
  readAppointments,
  writeAppointments
};
