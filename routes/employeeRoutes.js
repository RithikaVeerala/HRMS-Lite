/**
 * Employee Routes
 * RESTful API endpoints for employee management
 */

const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");

// GET all employees
router.get("/", employeeController.getEmployees);

// GET single employee by ID
router.get("/:id", employeeController.getEmployeeById);

// POST create new employee
router.post("/", employeeController.createEmployee);

// PUT update employee
router.put("/:id", employeeController.updateEmployee);

// DELETE employee
router.delete("/:id", employeeController.deleteEmployee);

module.exports = router;

