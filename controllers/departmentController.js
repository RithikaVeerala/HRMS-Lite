const pool = require("../config/db");

// Create Department
exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    const result = await pool.query(
      "INSERT INTO departments (name) VALUES ($1) RETURNING *",
      [name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Departments
exports.getDepartments = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM departments ORDER BY id"
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};