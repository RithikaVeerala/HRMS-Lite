/**
 * HRMS Backend - Plain Node.js (No Express)
 * Server running on port 5000
 */

const http = require("http");
const { Pool } = require("pg");
const url = require("url");

// Database Configuration
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "hrmslite",
  password: "rose123",
  port: 5432,
});

// Test database connection
pool.connect()
  .then(() => console.log("PostgreSQL Connected Successfully"))
  .catch(err => console.error("Database Connection Error:", err.message));

// CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true"
};

// Parse JSON Body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
};

// Email Validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate Employee
const validateEmployee = (data) => {
  const errors = [];
  if (!data.employee_id?.trim()) errors.push("Employee ID is required");
  if (!data.name?.trim()) errors.push("Name is required");
  if (!data.email?.trim()) errors.push("Email is required");
  else if (!EMAIL_REGEX.test(data.email)) errors.push("Invalid email format");
  return { valid: errors.length === 0, errors };
};

// ==================== API ROUTES ====================

// GET /api/employees
const getEmployees = async (res) => {
  try {
    const result = await pool.query(`
      SELECT e.id, e.employee_id, e.name, e.email, e.salary,
             e.department_id, d.name AS department_name, e.created_at
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      ORDER BY e.id DESC
    `);
    
    sendResponse(res, 200, {
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error("Error fetching employees:", err.message);
    sendResponse(res, 500, { success: false, error: "Server Error" });
  }
};

// POST /api/employees
const createEmployee = async (res, body) => {
  try {
    const { employee_id, name, email, salary, department_id } = body;

    // Validation
    const validation = validateEmployee({ employee_id, name, email });
    if (!validation.valid) {
      return sendResponse(res, 400, { success: false, error: validation.errors.join(", ") });
    }

    // Check duplicate employee_id
    const empCheck = await pool.query(
      "SELECT id FROM employees WHERE employee_id = $1",
      [employee_id.trim()]
    );
    if (empCheck.rows.length > 0) {
      return sendResponse(res, 400, { success: false, error: "Employee ID already exists" });
    }

    // Check duplicate email
    const emailCheck = await pool.query(
      "SELECT id FROM employees WHERE LOWER(email) = LOWER($1)",
      [email.trim()]
    );
    if (emailCheck.rows.length > 0) {
      return sendResponse(res, 400, { success: false, error: "Email already exists" });
    }

    // Insert employee
    const result = await pool.query(
      `INSERT INTO employees (employee_id, name, email, salary, department_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        employee_id.trim(),
        name.trim(),
        email.trim().toLowerCase(),
        salary || 0,
        department_id || null
      ]
    );

    sendResponse(res, 201, {
      success: true,
      message: "Employee created successfully",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("Error creating employee:", err.message);
    if (err.code === "23505") {
      return sendResponse(res, 400, { success: false, error: "Duplicate entry" });
    }
    sendResponse(res, 500, { success: false, error: "Server Error" });
  }
};

// GET /api/departments
const getDepartments = async (res) => {
  try {
    const result = await pool.query("SELECT * FROM departments ORDER BY id");
    sendResponse(res, 200, { 
      success: true, 
      data: result.rows 
    });
  } catch (err) {
    console.error("Error fetching departments:", err.message);
    sendResponse(res, 500, { success: false, error: "Server Error" });
  }
};

// POST /api/departments
const createDepartment = async (res, body) => {
  try {
    const { name } = body;
    if (!name) {
      return sendResponse(res, 400, { success: false, error: "Department name is required" });
    }
    const result = await pool.query(
      "INSERT INTO departments (name) VALUES ($1) RETURNING *",
      [name]
    );
    sendResponse(res, 201, { 
      success: true, 
      message: "Department created successfully",
      data: result.rows[0] 
    });
  } catch (err) {
    console.error("Error creating department:", err.message);
    sendResponse(res, 500, { success: false, error: "Server Error" });
  }
};

// GET /api/employees/:id
const getEmployeeById = async (res, id) => {
  try {
    const result = await pool.query(
      "SELECT e.id, e.employee_id, e.name, e.email, e.salary, e.department_id, d.name AS department_name, e.created_at FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE e.id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return sendResponse(res, 404, { success: false, error: "Employee not found" });
    }

    sendResponse(res, 200, { success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error fetching employee:", err.message);
    sendResponse(res, 500, { success: false, error: "Server Error" });
  }
};

// PUT /api/employees/:id
const updateEmployee = async (res, body, id) => {
  try {
    const { employee_id, name, email, salary, department_id } = body;

    // Validation
    const validation = validateEmployee({ employee_id, name, email });
    if (!validation.valid) {
      return sendResponse(res, 400, { success: false, error: validation.errors.join(", ") });
    }

    // Check if employee exists
    const empCheck = await pool.query(
      "SELECT id FROM employees WHERE id = $1",
      [id]
    );
    if (empCheck.rows.length === 0) {
      return sendResponse(res, 404, { success: false, error: "Employee not found" });
    }

    // Check duplicate employee_id (excluding current employee)
    const dupEmpCheck = await pool.query(
      "SELECT id FROM employees WHERE employee_id = $1 AND id != $2",
      [employee_id.trim(), id]
    );
    if (dupEmpCheck.rows.length > 0) {
      return sendResponse(res, 400, { success: false, error: "Employee ID already exists" });
    }

    // Check duplicate email (excluding current employee)
    const dupEmailCheck = await pool.query(
      "SELECT id FROM employees WHERE LOWER(email) = LOWER($1) AND id != $2",
      [email.trim(), id]
    );
    if (dupEmailCheck.rows.length > 0) {
      return sendResponse(res, 400, { success: false, error: "Email already exists" });
    }

    // Update employee
    const result = await pool.query(
      `UPDATE employees 
       SET employee_id = $1, name = $2, email = $3, salary = $4, department_id = $5
       WHERE id = $6
       RETURNING *`,
      [
        employee_id.trim(),
        name.trim(),
        email.trim().toLowerCase(),
        salary || 0,
        department_id || null,
        id
      ]
    );

    sendResponse(res, 200, {
      success: true,
      message: "Employee updated successfully",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("Error updating employee:", err.message);
    if (err.code === "23505") {
      return sendResponse(res, 400, { success: false, error: "Duplicate entry" });
    }
    sendResponse(res, 500, { success: false, error: "Server Error" });
  }
};

// DELETE /api/employees/:id
const deleteEmployee = async (res, id) => {
  try {
    // Check if employee exists
    const empCheck = await pool.query(
      "SELECT name FROM employees WHERE id = $1",
      [id]
    );
    if (empCheck.rows.length === 0) {
      return sendResponse(res, 404, { success: false, error: "Employee not found" });
    }

    const employeeName = empCheck.rows[0].name;

    await pool.query("DELETE FROM employees WHERE id = $1", [id]);

    sendResponse(res, 200, { 
      success: true, 
      message: `Employee "${employeeName}" deleted successfully` 
    });
  } catch (err) {
    console.error("Error deleting employee:", err.message);
    sendResponse(res, 500, { success: false, error: "Server Error" });
  }
};

// ==================== ATTENDANCE ROUTES ====================

// Validate attendance data
const validateAttendance = (attendanceData) => {
  const errors = [];
  if (!attendanceData.employee_id) errors.push("Employee is required");
  if (!attendanceData.date) errors.push("Date is required");
  if (!attendanceData.status) errors.push("Status is required");
  if (attendanceData.status && attendanceData.status !== "Present" && attendanceData.status !== "Absent") {
    errors.push("Status must be either 'Present' or 'Absent'");
  }
  return { valid: errors.length === 0, errors };
};

// GET /api/attendance - Get all attendance records
const getAttendance = async (res) => {
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

    sendResponse(res, 200, { 
      success: true, 
      count: result.rows.length,
      data: result.rows 
    });
  } catch (err) {
    console.error("Error fetching attendance:", err.message);
    sendResponse(res, 500, { success: false, error: "Server Error" });
  }
};

// POST /api/attendance - Mark attendance
const markAttendance = async (res, body) => {
  try {
    const { employee_id, status, date } = body;

    const validation = validateAttendance({ employee_id, status, date });
    if (!validation.valid) {
      return sendResponse(res, 400, { success: false, error: validation.errors.join(", ") });
    }

    // Check if employee exists
    const employeeExists = await pool.query("SELECT id, name FROM employees WHERE id = $1", [employee_id]);
    if (employeeExists.rows.length === 0) {
      return sendResponse(res, 404, { success: false, error: "Employee not found" });
    }

    // Check if attendance already marked for this employee on this date
    const existingAttendance = await pool.query(
      "SELECT id FROM attendance WHERE employee_id = $1 AND date = $2",
      [employee_id, date]
    );

    if (existingAttendance.rows.length > 0) {
      return sendResponse(res, 400, { success: false, error: "Attendance already marked for this employee on this date" });
    }

    const result = await pool.query(
      "INSERT INTO attendance (employee_id, status, date) VALUES ($1, $2, $3) RETURNING *",
      [employee_id, status, date]
    );

    sendResponse(res, 201, {
      success: true,
      message: "Attendance marked successfully",
      data: { ...result.rows[0], employee_name: employeeExists.rows[0].name }
    });
  } catch (err) {
    console.error("Error marking attendance:", err.message);
    if (err.code === "23505") {
      return sendResponse(res, 400, { success: false, error: "Attendance already marked" });
    }
    sendResponse(res, 500, { success: false, error: "Server Error" });
  }
};

// GET /api/attendance/employee/:employeeId - Get attendance by employee
const getAttendanceByEmployee = async (res, employeeId) => {
  try {
    const employeeExists = await pool.query("SELECT id, employee_id, name FROM employees WHERE id = $1", [employeeId]);
    if (employeeExists.rows.length === 0) {
      return sendResponse(res, 404, { success: false, error: "Employee not found" });
    }

    const result = await pool.query(`
      SELECT a.id, a.employee_id, a.date, a.status, a.created_at
      FROM attendance a WHERE a.employee_id = $1 ORDER BY a.date DESC
    `, [employeeId]);

    sendResponse(res, 200, { 
      success: true, 
      employee: employeeExists.rows[0],
      count: result.rows.length,
      data: result.rows 
    });
  } catch (err) {
    console.error("Error fetching employee attendance:", err.message);
    sendResponse(res, 500, { success: false, error: "Server Error" });
  }
};

// PUT /api/attendance/:id - Update attendance
const updateAttendance = async (res, body, id) => {
  try {
    const { status } = body;

    if (!status) {
      return sendResponse(res, 400, { success: false, error: "Status is required" });
    }

    if (status !== "Present" && status !== "Absent") {
      return sendResponse(res, 400, { success: false, error: "Status must be either 'Present' or 'Absent'" });
    }

    const existingAttendance = await pool.query("SELECT id FROM attendance WHERE id = $1", [id]);
    if (existingAttendance.rows.length === 0) {
      return sendResponse(res, 404, { success: false, error: "Attendance record not found" });
    }

    const result = await pool.query(
      "UPDATE attendance SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    sendResponse(res, 200, {
      success: true,
      message: "Attendance updated successfully",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("Error updating attendance:", err.message);
    sendResponse(res, 500, { success: false, error: "Server Error" });
  }
};

// DELETE /api/attendance/:id - Delete attendance
const deleteAttendance = async (res, id) => {
  try {
    const existingAttendance = await pool.query("SELECT id FROM attendance WHERE id = $1", [id]);
    if (existingAttendance.rows.length === 0) {
      return sendResponse(res, 404, { success: false, error: "Attendance record not found" });
    }

    await pool.query("DELETE FROM attendance WHERE id = $1", [id]);
    sendResponse(res, 200, { 
      success: true, 
      message: "Attendance record deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting attendance:", err.message);
    sendResponse(res, 500, { success: false, error: "Server Error" });
  }
};

// Helper: Send JSON Response
const sendResponse = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    ...corsHeaders
  });
  res.end(JSON.stringify(data));
};

// ==================== MAIN SERVER ====================

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Remove trailing slash
  const path = pathname.replace(/\/$/, "");

  console.log(`${method} ${path}`);

  try {
    // Route: GET /api/employees
    if (path === "/api/employees" && method === "GET") {
      return getEmployees(res);
    }

    // Route: POST /api/employees
    if (path === "/api/employees" && method === "POST") {
      const body = await parseBody(req);
      return createEmployee(res, body);
    }

    // Route: GET /api/departments
    if (path === "/api/departments" && method === "GET") {
      return getDepartments(res);
    }

    // Route: POST /api/departments
    if (path === "/api/departments" && method === "POST") {
      const body = await parseBody(req);
      return createDepartment(res, body);
    }

    // Route: GET /api/employees/:id
    if (path.match(/^\/api\/employees\/\d+$/) && method === "GET") {
      const id = path.split("/")[3];
      return getEmployeeById(res, id);
    }

    // Route: PUT /api/employees/:id
    if (path.match(/^\/api\/employees\/\d+$/) && method === "PUT") {
      const id = path.split("/")[3];
      const body = await parseBody(req);
      return updateEmployee(res, body, id);
    }

    // Route: DELETE /api/employees/:id
    if (path.match(/^\/api\/employees\/\d+$/) && method === "DELETE") {
      const id = path.split("/")[3];
      return deleteEmployee(res, id);
    }

    // ==================== ATTENDANCE ROUTES ====================
    
    // Route: GET /api/attendance
    if (path === "/api/attendance" && method === "GET") {
      return getAttendance(res);
    }

    // Route: POST /api/attendance
    if (path === "/api/attendance" && method === "POST") {
      const body = await parseBody(req);
      return markAttendance(res, body);
    }

    // Route: GET /api/attendance/employee/:employeeId
    if (path.match(/^\/api\/attendance\/employee\/\d+$/) && method === "GET") {
      const employeeId = path.split("/")[4];
      return getAttendanceByEmployee(res, employeeId);
    }

    // Route: PUT /api/attendance/:id
    if (path.match(/^\/api\/attendance\/\d+$/) && method === "PUT") {
      const id = path.split("/")[3];
      const body = await parseBody(req);
      return updateAttendance(res, body, id);
    }

    // Route: DELETE /api/attendance/:id
    if (path.match(/^\/api\/attendance\/\d+$/) && method === "DELETE") {
      const id = path.split("/")[3];
      return deleteAttendance(res, id);
    }

    // Route: Root
    if (path === "" || path === "/") {
      res.writeHead(200, { "Content-Type": "text/plain", ...corsHeaders });
      res.end("HRMS Lite Backend Running");
      return;
    }

    // 404 Not Found
    sendResponse(res, 404, { success: false, error: "Not Found" });

  } catch (err) {
    console.error("Server Error:", err.message);
    sendResponse(res, 500, { success: false, error: "Server Error" });
  }
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

