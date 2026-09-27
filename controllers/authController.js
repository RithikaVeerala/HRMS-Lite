const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔹 Register Admin
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO admins (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Login Admin
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM admins WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const admin = result.rows[0];

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};