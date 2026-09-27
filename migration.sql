-- =====================================================
-- Migration Script: Add employee_id to existing employees table
-- Run this if you have an existing employees table without employee_id column
-- =====================================================

-- Step 1: Add employee_id column if it doesn't exist
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50) UNIQUE;

-- Step 2: Update existing records with employee_id based on id
-- This will generate IDs like EMP001, EMP002, etc.
UPDATE employees 
SET employee_id = 'EMP' || LPAD(id::TEXT, 4, '0')
WHERE employee_id IS NULL OR employee_id = '';

-- Step 3: Verify the changes
-- SELECT id, employee_id, name, email FROM employees ORDER BY id;

-- =====================================================
-- Alternative: If you want to start fresh, drop and recreate
-- =====================================================

-- WARNING: Uncomment these lines only if you want to reset the database

-- DROP TABLE IF EXISTS attendance CASCADE;
-- DROP TABLE IF EXISTS employees CASCADE;
-- DROP TABLE IF EXISTS departments CASCADE;

-- Then run the commands from database.sql

