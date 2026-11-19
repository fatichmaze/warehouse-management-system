import nextEnv from "@next/env";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const rl = createInterface({ input: stdin, output: stdout });

async function resetAdminPassword() {
  try {
    const password = await rl.question(
      "Masukkan password baru Admin: "
    );

    if (password.length < 8) {
      console.log("Password minimal 8 karakter.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `UPDATE users
       SET password = $1
       WHERE email = $2 AND role = 'admin'
       RETURNING id, email`,
      [hashedPassword, "admin@wms.com"]
    );

    if (result.rows.length === 0) {
      console.log("Akun Admin tidak ditemukan.");
      return;
    }

    console.log("Password Admin berhasil diperbarui.");
    console.log("Email:", result.rows[0].email);
  } catch (error) {
    console.error("Gagal reset password:", error);
  } finally {
    rl.close();
    await pool.end();
  }
}

resetAdminPassword();
