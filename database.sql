-- =====================================================
-- HRMS Lite Database Setup Script

-- =====================================================

-- Create database (run this first if database doesn't exist)
-- CREATE DATABASE hrmslite;

-- =====================================================
-- DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- EMPLOYEES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    department_id INTEGER REFERENCES departments(id),
    salary DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ATTENDANCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date) -- Prevent duplicate attendance for same employee on same day
);

-- =====================================================
-- INSERT DEFAULT DEPARTMENTS
-- =====================================================
INSERT INTO departments (name) VALUES 
    ('HR'),
    ('IT'),
    ('Finance'),
    ('Marketing'),
    ('Operations'),
    ('Sales'),
    ('Customer Support'),
    ('Engineering')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- =====================================================
-- VIEW: EMPLOYEE WITH DEPARTMENT NAME
-- =====================================================
CREATE OR REPLACE VIEW v_employees_with_department AS
SELECT 
    e.id,
    e.employee_id,
    e.name,
    e.email,
    e.salary,
    e.department_id,
    d.name AS department_name,
    e.created_at
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
ORDER BY e.id;

-- =====================================================
-- VIEW: ATTENDANCE WITH EMPLOYEE DETAILS
-- =====================================================
CREATE OR REPLACE VIEW v_attendance_with_employees AS
SELECT 
    a.id,
    a.employee_id,
    e.name AS employee_name,
    e.employee_id AS emp_code,
    d.name AS department_name,
    a.date,
    a.status,
    a.created_at
FROM attendance a
LEFT JOIN employees e ON a.employee_id = e.id
LEFT JOIN departments d ON e.department_id = d.id
ORDER BY a.date DESC, e.name;

-- =====================================================
-- TEST QUERIES (run after inserting data)
-- =====================================================
-- SELECT * FROM v_employees_with_department;
-- SELECT * FROM v_attendance_with_employees;
-- SELECT * FROM departments;

