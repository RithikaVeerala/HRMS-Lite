const pool = require("../config/db");

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Employee validation
const validateEmployee = (data) => {
  const errors = [];

  if (!data.employee_id?.trim()) errors.push("Employee ID is required");
  if (!data.name?.trim()) errors.push("Name is required");

  if (!data.email?.trim()) errors.push("Email is required");
  else if (!EMAIL_REGEX.test(data.email)) errors.push("Invalid email format");

  return { valid: errors.length === 0, errors };
};


// GET all employees
exports.getEmployees = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id, e.employee_id, e.name, e.email, e.salary,
             e.department_id, d.name AS department_name, e.created_at
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      ORDER BY e.id DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (err) {
    console.error("Error fetching employees:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};


// GET employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM employees WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};


// CREATE employee
exports.createEmployee = async (req, res) => {
  try {

    const { employee_id, name, email, salary, department_id } = req.body;

    const validation = validateEmployee({ employee_id, name, email });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.errors.join(", ")
      });
    }

    // Check duplicate employee_id
    const empCheck = await pool.query(
      "SELECT id FROM employees WHERE employee_id = $1",
      [employee_id.trim()]
    );

    if (empCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Employee ID already exists"
      });
    }

    // Check duplicate email
    const emailCheck = await pool.query(
      "SELECT id FROM employees WHERE LOWER(email) = LOWER($1)",
      [email.trim()]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Email already exists"
      });
    }

    const result = await pool.query(
      `INSERT INTO employees
       (employee_id, name, email, salary, department_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        employee_id.trim(),
        name.trim(),
        email.trim().toLowerCase(),
        salary || 0,
        department_id || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: result.rows[0]
    });

  } catch (err) {

    console.error("Error creating employee:", err.message);

    if (err.code === "23505") {
      return res.status(400).json({
        success: false,
        error: "Duplicate entry"
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error"
    });
  }
};


// UPDATE employee
exports.updateEmployee = async (req, res) => {
  try {

    const { employee_id, name, email, salary, department_id } = req.body;

    const validation = validateEmployee({ employee_id, name, email });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.errors.join(", ")
      });
    }

    const result = await pool.query(
      `UPDATE employees
       SET employee_id=$1, name=$2, email=$3, salary=$4, department_id=$5
       WHERE id=$6
       RETURNING *`,
      [
        employee_id.trim(),
        name.trim(),
        email.trim().toLowerCase(),
        salary || 0,
        department_id || null,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};


// DELETE employee
exports.deleteEmployee = async (req, res) => {
  try {

    const result = await pool.query(
      "DELETE FROM employees WHERE id = $1 RETURNING name",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      });
    }

    res.json({
      success: true,
      message: `Employee "${result.rows[0].name}" deleted`
    });

  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};