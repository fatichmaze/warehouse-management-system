import nextEnv from "@next/env";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const users = [
  {
    name: "Administrator",
    email: "admin@wms.com",
    role: "admin",
  },
  {
    name: "Warehouse Manager",
    email: "manager@wms.com",
    role: "warehouse_manager",
  },
  {
    name: "Staff Gudang",
    email: "staff@wms.com",
    role: "staff",
  },
];

async function seedUsers() {
  try {
    for (const user of users) {
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [user.email]
      );

      if (existingUser.rows.length > 0) {
        console.log(`Akun ${user.email} sudah tersedia.`);
        continue;
      }

      const password = randomBytes(12).toString("hex");
      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        `INSERT INTO users (name, email, password, role, status)
         VALUES ($1, $2, $3, $4, 'approved')`,
        [user.name, user.email, hashedPassword, user.role]
      );

      console.log(`\nAkun: ${user.email}`);
      console.log(`Password awal: ${password}`);
    }

    console.log("\nProses pembuatan akun selesai.");
  } catch (error) {
    console.error("Gagal membuat akun:", error);
  } finally {
    await pool.end();
  }
}

seedUsers();
