/**
 * API Configuration
 * Centralized Axios instance for API calls
 * Base URL configured for backend server
 */

import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.error || "An error occurred";
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(new Error("Network error - server not responding"));
    } else {
      // Error in request setup
      return Promise.reject(error);
    }
  }
);

// ==================== EMPLOYEE API CALLS ====================

/**
 * Get all employees
 */
export const getEmployees = () => api.get("/employees");

/**
 * Get single employee by ID
 */
export const getEmployeeById = (id) => api.get(`/employees/${id}`);

/**
 * Create new employee
 */
export const createEmployee = (employeeData) => 
  api.post("/employees", employeeData);

/**
 * Update employee
 */
export const updateEmployee = (id, employeeData) => 
  api.put(`/employees/${id}`, employeeData);

/**
 * Delete employee
 */
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// ==================== ATTENDANCE API CALLS ====================

/**
 * Get all attendance records
 */
export const getAttendance = () => api.get("/attendance");

/**
 * Get attendance by employee ID
 */
export const getAttendanceByEmployee = (employeeId) => 
  api.get(`/attendance/employee/${employeeId}`);

/**
 * Mark attendance
 */
export const markAttendance = (attendanceData) => 
  api.post("/attendance", attendanceData);

/**
 * Update attendance
 */
export const updateAttendance = (id, status) => 
  api.put(`/attendance/${id}`, { status });

/**
 * Delete attendance
 */
export const deleteAttendance = (id) => api.delete(`/attendance/${id}`);

// ==================== DEPARTMENT API CALLS ====================

/**
 * Get all departments
 */
export const getDepartments = () => api.get("/departments");

/**
 * Create department
 */
export const createDepartment = (name) => 
  api.post("/departments", { name });

export default api;

