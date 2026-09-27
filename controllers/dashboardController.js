const pool = require("../config/db");

// ✅ Existing Function
exports.getDashboardStats = async (req, res) => {
  try {

    const totalEmployees = await pool.query(
      "SELECT COUNT(*) FROM employees"
    );

    const totalDepartments = await pool.query(
      "SELECT COUNT(*) FROM departments"
    );

    const todayPresent = await pool.query(`
      SELECT COUNT(*) FROM attendance
      WHERE status='Present' AND date = CURRENT_DATE
    `);

    const todayAbsent = await pool.query(`
      SELECT COUNT(*) FROM attendance
      WHERE status='Absent' AND date = CURRENT_DATE
    `);

    res.json({
      total_employees: Number(totalEmployees.rows[0].count),
      total_departments: Number(totalDepartments.rows[0].count),
      today_present: Number(todayPresent.rows[0].count),
      today_absent: Number(todayAbsent.rows[0].count)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Monthly Report
exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and Year are required"
      });
    }

    const result = await pool.query(`
      SELECT 
        e.name AS employee_name,
        COUNT(CASE WHEN a.status = 'Present' THEN 1 END) AS present_days,
        COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) AS absent_days,
        COUNT(a.id) AS total_days,
        ROUND(
          (COUNT(CASE WHEN a.status = 'Present' THEN 1 END) * 100.0) 
          / NULLIF(COUNT(a.id), 0),
          2
        ) AS attendance_percentage
      FROM employees e
      LEFT JOIN attendance a 
        ON e.id = a.employee_id
        AND EXTRACT(MONTH FROM a.date) = $1
        AND EXTRACT(YEAR FROM a.date) = $2
      GROUP BY e.name
    `, [month, year]);

    // ✅ Convert numeric strings to numbers
    res.json(
      result.rows.map(row => ({
        employee_name: row.employee_name,
        present_days: Number(row.present_days),
        absent_days: Number(row.absent_days),
        total_days: Number(row.total_days),
        attendance_percentage: Number(row.attendance_percentage)
      }))
    );

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};