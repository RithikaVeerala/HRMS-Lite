/**
 * Sidebar Component
 * Navigation menu for HRMS Lite application
 * Provides links to Employee Management and Attendance pages
 */

import React from "react";

function Sidebar({ currentPage, setCurrentPage }) {
  const menuItems = [
    {
      id: "employees",
      label: "👥 Employees",
      icon: "👥",
      description: "Manage employees",
    },
    {
      id: "attendance",
      label: "📅 Attendance",
      icon: "📅",
      description: "Track attendance",
    },
  ];

  return (
    <nav style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>🏢</span>
        <span style={styles.logoText}>HRMS Lite</span>
      </div>

      <ul style={styles.menu}>
        {menuItems.map((item) => (
          <li key={item.id} style={styles.menuItem}>
            <button
              onClick={() => setCurrentPage(item.id)}
              style={
                currentPage === item.id
                  ? { ...styles.menuLink, ...styles.menuLinkActive }
                  : styles.menuLink
              }
            >
              <span style={styles.menuIcon}>{item.icon}</span>
              <div style={styles.menuContent}>
                <span style={styles.menuLabel}>{item.label}</span>
                <span style={styles.menuDescription}>{item.description}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <p style={styles.footerText}>HRMS Lite v1.0</p>
          <p style={styles.copyright}>© 2024 All rights reserved</p>
        </div>
      </div>
    </nav>
  );
}

// Styles
const styles = {
  sidebar: {
    width: "260px",
    minHeight: "100vh",
    backgroundColor: "#1f2937",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 100,
  },
  logo: {
    padding: "24px 20px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderBottom: "1px solid #374151",
  },
  logoIcon: {
    fontSize: "28px",
  },
  logoText: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },
  menu: {
    listStyle: "none",
    padding: "16px 0",
    margin: 0,
    flex: 1,
  },
  menuItem: {
    margin: "4px 12px",
  },
  menuLink: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
    transition: "background-color 0.2s",
  },
  menuLinkActive: {
    backgroundColor: "#4f46e5",
  },
  menuIcon: {
    fontSize: "20px",
    width: "24px",
    textAlign: "center",
  },
  menuContent: {
    display: "flex",
    flexDirection: "column",
  },
  menuLabel: {
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
  },
  menuDescription: {
    color: "#9ca3af",
    fontSize: "12px",
    marginTop: "2px",
  },
  footer: {
    padding: "20px",
    borderTop: "1px solid #374151",
  },
  footerContent: {
    textAlign: "center",
  },
  footerText: {
    color: "#9ca3af",
    fontSize: "13px",
    fontWeight: "500",
    margin: 0,
  },
  copyright: {
    color: "#6b7280",
    fontSize: "11px",
    margin: "4px 0 0 0",
  },
};

export default Sidebar;

