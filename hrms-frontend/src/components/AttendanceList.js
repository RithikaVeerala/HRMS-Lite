/**
 * AttendanceList Component
 * Displays attendance records in a table format
 * Shows employee details, date, status, and action buttons
 */

import React, { useEffect, useState } from "react";
import { getAttendance, deleteAttendance, updateAttendance } from "../api";

function AttendanceList({ refresh }) {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  // Fetch attendance when refresh prop changes
  useEffect(() => {
    fetchAttendance();
  }, [refresh]);

  const fetchAttendance = () => {
    setIsLoading(true);
    getAttendance()
      .then((response) => {
        setAttendanceRecords(response.data || response);
      })
      .catch((error) => {
        console.error("Error fetching attendance:", error);
        alert("Failed to load attendance records");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDelete = async (id, employeeName, date) => {
    if (!window.confirm(`Delete attendance for "${employeeName}" on "${date}"?`)) {
      return;
    }

    setDeleteId(id);
    try {
      await deleteAttendance(id);
      alert("Attendance record deleted successfully!");
      fetchAttendance();
    } catch (error) {
      console.error("Error deleting attendance:", error);
      alert(error.message || "Failed to delete attendance");
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Present" ? "Absent" : "Present";
    
    try {
      await updateAttendance(id, newStatus);
      alert(`Status updated to ${newStatus}!`);
      fetchAttendance();
    } catch (error) {
      console.error("Error updating attendance:", error);
      alert(error.message || "Failed to update attendance");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter records
  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesEmployee = filterEmployee 
      ? record.employee_id === parseInt(filterEmployee)
      : true;
    const matchesDate = filterDate
      ? record.date === filterDate
      : true;
    return matchesEmployee && matchesDate;
  });

  // Get unique employees from records
  const uniqueEmployees = [...new Map(
    attendanceRecords.map(item => [item.employee_id, { id: item.employee_id, name: item.employee_name, emp_code: item.emp_code }])
  ).values()];

  // Calculate statistics
  const totalPresent = filteredRecords.filter(r => r.status === "Present").length;
  const totalAbsent = filteredRecords.filter(r => r.status === "Absent").length;

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.headerContent}>
          <div>
            <h2 style={styles.cardTitle}>📋 Attendance Records</h2>
            <p style={styles.cardSubtitle}>
              {filteredRecords.length} records
              {totalPresent > 0 && ` | ✅ ${totalPresent} Present`}
              {totalAbsent > 0 && ` | ❌ ${totalAbsent} Absent`}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filter by Employee:</label>
          <select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Employees</option>
            {uniqueEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.emp_code} - {emp.name}
              </option>
            ))}
          </select>
        </div>
        
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filter by Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={styles.filterInput}
          />
        </div>

        {(filterEmployee || filterDate) && (
          <button
            onClick={() => {
              setFilterEmployee("");
              setFilterDate("");
            }}
            style={styles.clearFilter}
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      <div style={styles.tableContainer}>
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading attendance records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📅</div>
            <h3 style={styles.emptyTitle}>No Attendance Records Found</h3>
            <p style={styles.emptyText}>
              Mark attendance for employees using the form above.
            </p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Employee ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record, index) => (
                <tr
                  key={record.id}
                  style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}
                >
                  <td style={styles.td}>
                    <span style={styles.dateBadge}>
                      {formatDate(record.date)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.empIdBadge}>{record.emp_code || record.employee_id}</span>
                  </td>
                  <td style={styles.tdName}>
                    <div style={styles.avatar}>
                      {record.employee_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    {record.employee_name || "N/A"}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.deptBadge}>
                      {record.department_name || "N/A"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={record.status === "Present" ? styles.statusPresent : styles.statusAbsent}
                      onClick={() => handleToggleStatus(record.id, record.status)}
                      title="Click to toggle status"
                    >
                      {record.status === "Present" ? "✅ Present" : "❌ Absent"}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={deleteId === record.id ? {...styles.deleteBtn, ...styles.deleteBtnDisabled} : styles.deleteBtn}
                      onClick={() => handleDelete(record.id, record.employee_name, formatDate(record.date))}
                      disabled={deleteId === record.id}
                    >
                      {deleteId === record.id ? "⏳" : "🗑️"}
                    </button>
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
    marginBottom: "4px",
    margin: 0,
  },
  cardSubtitle: {
    color: "#6b7280",
    fontSize: "14px",
    margin: 0,
  },
  filters: {
    display: "flex",
    gap: "16px",
    padding: "20px 30px",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  filterLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#6b7280",
  },
  filterSelect: {
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    minWidth: "180px",
    cursor: "pointer",
  },
  filterInput: {
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    cursor: "pointer",
  },
  clearFilter: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#6b7280",
    backgroundColor: "#e5e7eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    alignSelf: "flex-end",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  headerRow: {
    backgroundColor: "#059669",
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
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#059669",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "600",
  },
  dateBadge: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
  },
  empIdBadge: {
    backgroundColor: "#e0e7ff",
    color: "#4f46e5",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
  },
  deptBadge: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
  },
  statusPresent: {
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: "600",
    backgroundColor: "#d1fae5",
    color: "#065f46",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  statusAbsent: {
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: "600",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  rowEven: {
    backgroundColor: "#ffffff",
  },
  rowOdd: {
    backgroundColor: "#f9fafb",
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: "500",
    borderRadius: "6px",
    cursor: "pointer",
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
    borderTop: "3px solid #059669",
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

export default AttendanceList;

