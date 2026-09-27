/**
 * AttendanceForm Component
 * Form to mark attendance for employees
 * Select employee, date, and status (Present/Absent)
 */

import React, { useState, useEffect } from "react";
import { getEmployees, markAttendance } from "../api";

function AttendanceForm({ refreshAttendance }) {
  // Form state
  const [employee, setEmployee] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("Present");
  
  // UI state
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(response.data || response);
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to load employees");
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!employee) {
      newErrors.employee = "Please select an employee";
    }

    if (!date) {
      newErrors.date = "Please select a date";
    }

    if (!status) {
      newErrors.status = "Please select status";
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
      await markAttendance({
        employee_id: parseInt(employee),
        date: date,
        status: status,
      });

      // Reset form
      setEmployee("");
      setDate(new Date().toISOString().split("T")[0]);
      setStatus("Present");

      // Refresh attendance list
      if (refreshAttendance) {
        refreshAttendance();
      }

      alert("Attendance Marked Successfully!");
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert(error.message || "Failed to mark attendance. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected employee name
  const selectedEmployee = employees.find(emp => emp.id === parseInt(employee));

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>📅 Mark Attendance</h2>
        <p style={styles.cardSubtitle}>Record daily attendance for employees</p>
      </div>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          {/* Employee Select */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Employee <span style={styles.required}>*</span>
            </label>
            <select
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              style={errors.employee ? {...styles.select, ...styles.selectError} : styles.select}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employee_id} - {emp.name}
                </option>
              ))}
            </select>
            {errors.employee && <span style={styles.errorText}>{errors.employee}</span>}
            {selectedEmployee && (
              <div style={styles.selectedInfo}>
                📧 {selectedEmployee.email} | {selectedEmployee.department_name || "No Department"}
              </div>
            )}
          </div>

          {/* Date Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Date <span style={styles.required}>*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={errors.date ? {...styles.input, ...styles.inputError} : styles.input}
              max={new Date().toISOString().split("T")[0]}
            />
            {errors.date && <span style={styles.errorText}>{errors.date}</span>}
          </div>

          {/* Status Select */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Status <span style={styles.required}>*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={styles.select}
            >
              <option value="Present">✅ Present</option>
              <option value="Absent">❌ Absent</option>
            </select>
            {errors.status && <span style={styles.errorText}>{errors.status}</span>}
          </div>
        </div>

        {/* Status Preview */}
        <div style={styles.statusPreview}>
          <div style={status === "Present" ? styles.statusPresent : styles.statusAbsent}>
            {status === "Present" ? "✅ Present" : "❌ Absent"}
          </div>
        </div>

        {/* Submit Button */}
        <div style={styles.buttonContainer}>
          <button
            type="submit"
            disabled={isLoading}
            style={isLoading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
          >
            {isLoading ? "⏳ Marking..." : "📝 Mark Attendance"}
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
  selectError: {
    borderColor: "#ef4444",
  },
  selectedInfo: {
    marginTop: "8px",
    padding: "8px 12px",
    backgroundColor: "#f3f4f6",
    borderRadius: "6px",
    fontSize: "12px",
    color: "#6b7280",
  },
  statusPreview: {
    marginBottom: "24px",
    display: "flex",
    justifyContent: "center",
  },
  statusPresent: {
    padding: "12px 32px",
    backgroundColor: "#d1fae5",
    color: "#065f46",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
  },
  statusAbsent: {
    padding: "12px 32px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "10px",
  },
  button: {
    backgroundColor: "#059669",
    color: "#ffffff",
    border: "none",
    padding: "14px 32px",
    fontSize: "15px",
    fontWeight: "600",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s, transform 0.1s",
    boxShadow: "0 2px 8px rgba(5, 150, 105, 0.3)",
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

export default AttendanceForm;

