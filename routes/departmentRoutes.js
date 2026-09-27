console.log("Department Routes File Loaded");

const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");

router.post("/", departmentController.createDepartment);
router.get("/", departmentController.getDepartments);

module.exports = router;