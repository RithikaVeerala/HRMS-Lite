/**
 * AddEmployee Component
 * Form to add new employee with validation
 * Includes Employee ID, Name, Email, Department fields
 */

import React, { useState, useEffect } from "react";
import { createEmployee, getDepartments } from "../api";

function AddEmployee({ refreshEmployees }) {
  // Form state
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [salary, setSalary] = useState("");
  const [department, setDepartment] = useState("");
  
  // UI state
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      // API returns: { success: true, data: [...] }
      if (response && response.success === true) {
        setDepartments(response.data || []);
      } else if (Array.isArray(response)) {
        // Fallback: treat as array directly
        setDepartments(response);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Employee ID is required
    if (!employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    }

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare data - employee_id is REQUIRED
      const employeeData = {
        employee_id: employeeId.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        salary: salary || 0,
        department_id: department || null,
      };

      await createEmployee(employeeData);

      // Reset form
      setEmployeeId("");
      setName("");
      setEmail("");
      setSalary("");
      setDepartment("");

      // Refresh employee list
      if (refreshEmployees) {
        refreshEmployees();
      }

      alert("Employee Added Successfully!");
    } catch (error) {
      console.error("Error adding employee:", error);
      alert(error.message || "Failed to add employee. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>➕ Add New Employee</h2>
        <p style={styles.cardSubtitle}>Fill in the employee details below</p>
      </div>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          {/* Employee ID Input - Required */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Employee ID <span style={styles.required}>*</span></label>
            <input
              type="text"
              placeholder="e.g., EMP001 (Required)"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              style={errors.employeeId ? {...styles.input, ...styles.inputError} : styles.input}
            />
            {errors.employeeId && <span style={styles.errorText}>{errors.employeeId}</span>}
          </div>

          {/* Name Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name <span style={styles.required}>*</span></label>
            <input
              type="text"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={errors.name ? {...styles.input, ...styles.inputError} : styles.input}
            />
            {errors.name && <span style={styles.errorText}>{errors.name}</span>}
          </div>

          {/* Email Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address <span style={styles.required}>*</span></label>
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={errors.email ? {...styles.input, ...styles.inputError} : styles.input}
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>

          {/* Salary Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Salary</label>
            <input
              type="number"
              placeholder="Enter salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Department Select */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={styles.select}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div style={styles.buttonContainer}>
          <button
            type="submit"
            disabled={isLoading}
            style={isLoading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
          >
            {isLoading ? "⏳ Adding..." : "➕ Add Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Styles
const styles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "24px 30px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#fafbfc",
  },
  cardTitle: {
    color: "#1f2937",
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "4px",
    margin: 0,
  },
  cardSubtitle: {
    color: "#6b7280",
    fontSize: "14px",
    margin: 0,
  },
  form: {
    padding: "30px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    marginBottom: "24px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    color: "#374151",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
  },
  required: {
    color: "#ef4444",
  },
  input: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  select: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    color: "#1f2937",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "10px",
  },
  button: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    border: "none",
    padding: "14px 32px",
    fontSize: "15px",
    fontWeight: "600",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s, transform 0.1s",
    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  errorText: {
    color: "#ef4444",
    fontSize: "12px",
    marginTop: "4px",
  },
};

export default AddEmployee;

