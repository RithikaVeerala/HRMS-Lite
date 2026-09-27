const pool = require("./config/db");

async function checkDB() {
  try {
    // Check attendance table structure
    const attendanceCols = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'attendance' ORDER BY ordinal_position"
    );
    console.log("Attendance table columns:");
    console.log(JSON.stringify(attendanceCols.rows, null, 2));

    // Check if there's data in employees
    const employees = await pool.query("SELECT id, employee_id, name FROM employees LIMIT 5");
    console.log("\nEmployees sample:");
    console.log(JSON.stringify(employees.rows, null, 2));

    // Check if there's data in attendance
    const attendance = await pool.query("SELECT * FROM attendance LIMIT 5");
    console.log("\nAttendance sample:");
    console.log(JSON.stringify(attendance.rows, null, 2));

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

checkDB();

