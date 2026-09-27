/**
 * EmployeeTable Component
 * Displays list of employees in a table with edit and delete functionality
 * Shows Employee ID, Name, Email, Department, and Action buttons
 */

import React, { useEffect, useState } from "react";
import { getEmployees, deleteEmployee } from "../api";
import EditEmployee from "./EditEmployee";

function EmployeeTable({ refresh }) {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Fetch employees when refresh prop changes
  useEffect(() => {
    fetchEmployees();
  }, [refresh]);

  const fetchEmployees = () => {
    setIsLoading(true);
    getEmployees()
      .then((response) => {
        // API interceptor returns response.data directly
        // Check if response has success property (from our API format)
        if (response && response.success === true) {
          setEmployees(response.data || []);
        } else if (Array.isArray(response)) {
          // Fallback: treat as array directly
          setEmployees(response);
        } else {
          console.error("Invalid response format:", response);
          setEmployees([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching employees:", error);
        alert(error.message || "Failed to load employees");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDelete = async (id, employeeName) => {
    if (!window.confirm(`Are you sure you want to delete "${employeeName}"?`)) {
      return;
    }

    setDeleteId(id);
    try {
      await deleteEmployee(id);
      alert("Employee deleted successfully!");
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert(error.message || "Failed to delete employee");
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
  };

  const handleEditClose = () => {
    setEditingEmployee(null);
  };

  const handleEditSuccess = () => {
    fetchEmployees();
    setEditingEmployee(null);
  };

  // Format salary to currency
  const formatSalary = (salary) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(salary);
  };

  // Get status badge color
  const getStatusBadge = (department) => {
    if (!department) return styles.noDept;
    return styles.deptBadge;
  };

  return (
    <div style={styles.card}>
      {editingEmployee && (
        <EditEmployee
          employee={editingEmployee}
          refreshEmployees={handleEditSuccess}
          close={handleEditClose}
        />
      )}
      <div style={styles.cardHeader}>
        <div style={styles.headerContent}>
          <h2 style={styles.cardTitle}>👥 Employee List</h2>
          <span style={styles.badge}>{employees.length} employees</span>
        </div>
      </div>

      <div style={styles.tableContainer}>
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👥</div>
            <h3 style={styles.emptyTitle}>No Employees Found</h3>
            <p style={styles.emptyText}>
              Add your first employee using the form above to get started.
            </p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Emp ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Salary</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp, index) => (
                <tr
                  key={emp.id}
                  style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f3f4f6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      index % 2 === 0 ? "#ffffff" : "#f9fafb")
                  }
                >
                  <td style={styles.td}>
                    <span style={styles.empIdBadge}>{emp.employee_id || emp.id}</span>
                  </td>
                  <td style={styles.tdName}>
                    <div style={styles.avatar}>
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    {emp.name}
                  </td>
                  <td style={styles.td}>{emp.email}</td>
                  <td style={styles.td}>
                    <span style={styles.salaryBadge}>
                      {formatSalary(emp.salary)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={getStatusBadge(emp.department_name)}>
                      {emp.department_name || "N/A"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.editBtn}
                        onClick={() => handleEdit(emp)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        style={deleteId === emp.id ? {...styles.deleteBtn, ...styles.deleteBtnDisabled} : styles.deleteBtn}
                        onClick={() => handleDelete(emp.id, emp.name)}
                        disabled={deleteId === emp.id}
                      >
                        {deleteId === emp.id ? "⏳" : "🗑️"} Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: "#1f2937",
    fontSize: "20px",
    fontWeight: "600",
    margin: 0,
  },
  badge: {
    backgroundColor: "#e0e7ff",
    color: "#4f46e5",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  headerRow: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
  },
  th: {
    padding: "16px 20px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  td: {
    padding: "16px 20px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #e5e7eb",
  },
  tdName: {
    padding: "16px 20px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600",
  },
  empIdBadge: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
  },
  rowEven: {
    backgroundColor: "#ffffff",
    transition: "background-color 0.2s",
  },
  rowOdd: {
    backgroundColor: "#f9fafb",
    transition: "background-color 0.2s",
  },
  salaryBadge: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
  },
  deptBadge: {
    backgroundColor: "#e0e7ff",
    color: "#4f46e5",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
  },
  noDept: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
  },
  editBtn: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "500",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "500",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  deleteBtnDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    color: "#6b7280",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #4f46e5",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
    opacity: 0.5,
  },
  emptyTitle: {
    color: "#1f2937",
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "8px",
    margin: 0,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: "14px",
    margin: 0,
  },
};

export default EmployeeTable;

