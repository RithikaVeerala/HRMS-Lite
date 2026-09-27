/**
 * HRMS Lite - Main Application Component
 * Employee and Attendance Management System
 * 
 * Features:
 * - Employee Management (Add, View, Delete)
 * - Attendance Management (Mark, View)
 * - Sidebar Navigation
 * - Responsive Dashboard Layout
 */

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import AddEmployee from "./components/AddEmployee";
import EmployeeTable from "./components/EmployeeTable";
import AttendanceForm from "./components/AttendanceForm";
import AttendanceList from "./components/AttendanceList";
import "./index.css";

function App() {
  // State for navigation
  const [currentPage, setCurrentPage] = useState("employees");
  
  // State for refreshing data
  const [employeeRefresh, setEmployeeRefresh] = useState(false);
  const [attendanceRefresh, setAttendanceRefresh] = useState(false);

  // Handler to refresh employee list
  const refreshEmployees = () => {
    setEmployeeRefresh(!employeeRefresh);
  };

  // Handler to refresh attendance list
  const refreshAttendance = () => {
    setAttendanceRefresh(!attendanceRefresh);
  };

  // Render page content based on current page
  const renderPage = () => {
    switch (currentPage) {
      case "employees":
        return (
          <div style={styles.pageContent}>
            {/* Header */}
            <div style={styles.pageHeader}>
              <h1 style={styles.pageTitle}>👥 Employee Management</h1>
              <p style={styles.pageSubtitle}>Manage your organization's employees</p>
            </div>

            {/* Add Employee Form */}
            <section style={styles.section}>
              <AddEmployee refreshEmployees={refreshEmployees} />
            </section>

            {/* Employee List Table */}
            <section style={styles.section}>
              <EmployeeTable refresh={employeeRefresh} />
            </section>
          </div>
        );

      case "attendance":
        return (
          <div style={styles.pageContent}>
            {/* Header */}
            <div style={styles.pageHeader}>
              <h1 style={styles.pageTitle}>📅 Attendance Management</h1>
              <p style={styles.pageSubtitle}>Track employee attendance records</p>
            </div>

            {/* Mark Attendance Form */}
            <section style={styles.section}>
              <AttendanceForm refreshAttendance={refreshAttendance} />
            </section>

            {/* Attendance List Table */}
            <section style={styles.section}>
              <AttendanceList refresh={attendanceRefresh} />
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.appContainer}>
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        {/* Top Navigation Bar */}
        <header style={styles.topBar}>
          <div style={styles.topBarContent}>
            <h2 style={styles.topBarTitle}>
              {currentPage === "employees" ? "Employee Management" : "Attendance Management"}
            </h2>
            <div style={styles.topBarActions}>
              <span style={styles.date}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {renderPage()}

        {/* Footer */}
        <footer style={styles.footer}>
          <p>&copy; 2024 HRMS Lite. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

// Styles
const styles = {
  appContainer: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
  },
  mainContent: {
    flex: 1,
    marginLeft: "260px", // Sidebar width
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  topBar: {
    backgroundColor: "#ffffff",
    padding: "16px 32px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  topBarContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  topBarTitle: {
    color: "#1f2937",
    fontSize: "20px",
    fontWeight: "600",
    margin: 0,
  },
  topBarActions: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  date: {
    color: "#6b7280",
    fontSize: "14px",
  },
  pageContent: {
    flex: 1,
    padding: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
  },
  pageHeader: {
    marginBottom: "24px",
  },
  pageTitle: {
    color: "#1f2937",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  pageSubtitle: {
    color: "#6b7280",
    fontSize: "16px",
    margin: 0,
  },
  section: {
    marginBottom: "32px",
  },
  footer: {
    backgroundColor: "#ffffff",
    padding: "20px 32px",
    textAlign: "center",
    boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)",
    marginTop: "auto",
  },
};

export default App;

