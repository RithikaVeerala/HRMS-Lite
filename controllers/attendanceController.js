/**
 * Attendance Controller
 * Handles all attendance-related database operations
 * Note: This file is NOT currently used - routes are inline in server.js
 */

const pool = require("../config/db");

/**
 * Validate attendance data
 */
const validateAttendance = (attendanceData) => {
  const errors = [];

  if (!attendanceData.employee_id) {
    errors.push("Employee is required");
  }

  if (!attendanceData.date) {
    errors.push("Date is required");
  }

  if (!attendanceData.status) {
    errors.push("Status is required");
  }

  if (attendanceData.status && attendanceData.status !== "Present" && attendanceData.status !== "Absent") {
    errors.push("Status must be either 'Present' or 'Absent'");
  }

  if (attendanceData.date) {
    const dateObj = new Date(attendanceData.date);
    if (isNaN(dateObj.getTime())) {
      errors.push("Invalid date format");
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * GET /api/attendance
 * Get all attendance records with employee and department details
 */
exports.getAttendance = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id,
        a.employee_id,
        e.employee_id AS emp_code,
        e.name AS employee_name,
        d.name AS department_name,
        a.date,
        a.status,
        a.created_at
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      ORDER BY a.date DESC, e.name ASC
    `);

    res.json({ 
      success: true, 
      count: result.rows.length,
      data: result.rows 
    });
  } catch (err) {
    console.error("Error fetching attendance:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

/**
 * POST /api/attendance
 * Mark attendance for an employee
 */
exports.markAttendance = async (req, res) => {
  try {
    const { employee_id, status, date } = req.body;

    const validation = validateAttendance({ employee_id, status, date });
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.errors.join(", ") });
    }

    // Check if employee exists
    const employeeExists = await pool.query(
      "SELECT id, name FROM employees WHERE id = $1", 
      [employee_id]
    );
    if (employeeExists.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    // Check if attendance already marked for this employee on this date
    const existingAttendance = await pool.query(
      "SELECT id FROM attendance WHERE employee_id = $1 AND date = $2",
      [employee_id, date]
    );

    if (existingAttendance.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Attendance already marked for this employee on this date" 
      });
    }

    // Insert attendance record
    const result = await pool.query(
      "INSERT INTO attendance (employee_id, status, date) VALUES ($1, $2, $3) RETURNING *",
      [employee_id, status, date]
    );

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: { ...result.rows[0], employee_name: employeeExists.rows[0].name }
    });
  } catch (err) {
    console.error("Error marking attendance:", err.message);
    if (err.code === "23505") {
      return res.status(400).json({ success: false, error: "Attendance already marked" });
    }
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

/**
 * GET /api/attendance/employee/:employeeId
 * Get attendance records for a specific employee
 */
exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employeeExists = await pool.query(
      "SELECT id, employee_id, name FROM employees WHERE id = $1", 
      [employeeId]
    );
    if (employeeExists.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    const result = await pool.query(`
      SELECT a.id, a.employee_id, a.date, a.status, a.created_at
      FROM attendance a WHERE a.employee_id = $1 ORDER BY a.date DESC
    `, [employeeId]);

    res.json({ 
      success: true, 
      employee: employeeExists.rows[0], 
      count: result.rows.length, 
      data: result.rows 
    });
  } catch (err) {
    console.error("Error fetching employee attendance:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

/**
 * PUT /api/attendance/:id
 * Update attendance status
 */
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: "Status is required" });
    }

    if (status !== "Present" && status !== "Absent") {
      return res.status(400).json({ 
        success: false, 
        error: "Status must be either 'Present' or 'Absent'" 
      });
    }

    const existingAttendance = await pool.query(
      "SELECT id FROM attendance WHERE id = $1", 
      [id]
    );
    if (existingAttendance.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Attendance record not found" 
      });
    }

    const result = await pool.query(
      "UPDATE attendance SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    res.json({ 
      success: true, 
      message: "Attendance updated successfully", 
      data: result.rows[0] 
    });
  } catch (err) {
    console.error("Error updating attendance:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

/**
 * DELETE /api/attendance/:id
 * Delete attendance record
 */
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const existingAttendance = await pool.query(
      "SELECT id FROM attendance WHERE id = $1", 
      [id]
    );
    if (existingAttendance.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Attendance record not found" 
      });
    }

    await pool.query("DELETE FROM attendance WHERE id = $1", [id]);
    res.json({ 
      success: true, 
      message: "Attendance record deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting attendance:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

module.exports = exports;

