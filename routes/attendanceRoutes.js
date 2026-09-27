/**
 * Attendance Routes
 * RESTful API endpoints for attendance management
 * 
 * Note: This file is NOT currently used - routes are inline in server.js
 * 
 * Endpoints:
 * GET    /api/attendance                 - Get all attendance records
 * GET    /api/attendance/employee/:id   - Get attendance by employee
 * POST   /api/attendance                 - Mark attendance
 * PUT    /api/attendance/:id             - Update attendance
 * DELETE /api/attendance/:id             - Delete attendance
 */

const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

// GET all attendance records
router.get("/", attendanceController.getAttendance);

// GET attendance by employee ID
router.get("/employee/:employeeId", attendanceController.getAttendanceByEmployee);

// POST mark attendance
router.post("/", attendanceController.markAttendance);

// PUT update attendance
router.put("/:id", attendanceController.updateAttendance);

// DELETE attendance
router.delete("/:id", attendanceController.deleteAttendance);

module.exports = router;

