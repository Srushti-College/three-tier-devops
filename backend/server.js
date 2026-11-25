import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "employee_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres"
});

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        department VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Database table initialized");
  } catch (error) {
    console.error("Database initialization failed:", error.message);
  }
}

app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    service: "backend"
  });
});

app.get("/api/employees", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM employees ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch employees"
    });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    const { name, email, department } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({
        error: "Name, email and department are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO employees (name, email, department)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, email, department]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create employee"
    });
  }
});

app.delete("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM employees WHERE id = $1",
      [id]
    );

    res.json({
      message: "Employee deleted successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete employee"
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Backend running on port ${PORT}`);

  await initializeDatabase();
});
