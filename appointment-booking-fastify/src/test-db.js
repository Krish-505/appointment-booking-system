import db from "./config/db.js";

const test = async () => {
  const [rows] = await db.query("SELECT 1");
  console.log("✅ DB Connected:", rows);
};

test();
import { validateUser } from "./services/user.service.js";

console.log(await validateUser("testuser", "temp")); // null (hashed mismatch)
