# HRMS Lite - Full Stack HR Management System

A modern, production-ready HRMS (Human Resource Management System) Lite application built with the MERN stack (minus MongoDB - using PostgreSQL instead).

## 🏗️ Project Structure

```
hrms-lite-backend/
├── config/
│   └── db.js                 # PostgreSQL database configuration
├── controllers/
│   ├── employeeController.js # Employee CRUD operations
│   ├── attendanceController.js # Attendance management
│   └── departmentController.js # Department operations
├── routes/
│   ├── employeeRoutes.js     # Employee API endpoints
│   ├── attendanceRoutes.js  # Attendance API endpoints
│   └── departmentRoutes.js  # Department API endpoints
├── database.sql              # PostgreSQL database setup
├── server.js                 # Express server entry point
├── package.json              # Backend dependencies
└── hrms-frontend/            # React frontend
    ├── src/
    │   ├── api.js           # API configuration
    │   ├── App.js           # Main application component
    │   ├── index.css        # Global styles
    │   └── components/
    │       ├── AddEmployee.js      # Add employee form
    │       ├── EmployeeTable.js     # Employee list table
    │       ├── AttendanceForm.js    # Mark attendance form
    │       ├── AttendanceList.js   # Attendance records table
    │       └── Sidebar.js          # Navigation sidebar
    └── package.json          # Frontend dependencies
```

## 🛠️ Tech Stack

- **Frontend:** React 19, Axios, React Scripts
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **HTTP Client:** Axios

## 📋 Features

### Employee Management
- ✅ Add new employee with Employee ID, Name, Email, Department
- ✅ View all employees in a table
- ✅ Delete employees
- ✅ Email format validation
- ✅ Duplicate employee check

### Attendance Management
- ✅ Mark attendance (Present/Absent)
- ✅ View attendance records for all employees
- ✅ Filter attendance by employee or date
- ✅ Toggle attendance status

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### Step 1: Set Up PostgreSQL Database

1. Open pgAdmin or use psql command line
2. Create a new database named `hrmslite`
3. Run the SQL commands from `database.sql`:

```sql
-- Run these commands in pgAdmin or psql
-- Make sure you're connected to the hrmslite database

-- Create tables
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    department_id INTEGER REFERENCES departments(id),
    salary DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- Insert default departments
INSERT INTO departments (name) VALUES 
    ('HR'), ('IT'), ('Finance'), ('Marketing'), ('Operations')
ON CONFLICT (name) DO NOTHING;
```

### Step 2: Configure Database Connection

Edit `config/db.js` with your PostgreSQL credentials:

```javascript
const pool = new Pool({
  user: "postgres",        // Your PostgreSQL username
  host: "localhost",
  database: "hrmslite",
  password: "your_password", // Your PostgreSQL password
  port: 5432,
});
```

### Step 3: Install Backend Dependencies

```bash
cd d:/hrms-lite-backend
npm install
```

### Step 4: Install Frontend Dependencies

```bash
cd d:/hrms-lite-backend/hrms-frontend
npm install
```

### Step 5: Start the Application

**Start Backend Server:**
```bash
cd d:/hrms-lite-backend
node server.js
```
Server will run on http://localhost:5000

**Start Frontend Development Server:**
```bash
cd d:/hrms-lite-backend/hrms-frontend
npm start
```
Frontend will open on http://localhost:3000

## 📡 API Endpoints

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees |
| GET | `/api/employees/:id` | Get employee by ID |
| POST | `/api/employees` | Create new employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | Get all attendance records |
| GET | `/api/attendance/employee/:id` | Get attendance by employee |
| POST | `/api/attendance` | Mark attendance |
| PUT | `/api/attendance/:id` | Update attendance |
| DELETE | `/api/attendance/:id` | Delete attendance |

### Departments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/departments` | Get all departments |
| POST | `/api/departments` | Create department |

## 🎨 UI Features

- Modern card-based layout
- Soft shadows and rounded corners
- Responsive design
- Interactive hover effects
- Loading states
- Empty states
- Form validation
- Confirmation dialogs

## ⚠️ Important Notes

1. **Database Migration:** The existing employees table needs the `employee_id` column. Run:
```sql
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50) UNIQUE;
```

2. **Port Availability:** Ensure ports 3000 (frontend) and 5000 (backend) are available.

3. **CORS:** CORS is already configured in the backend.

## 📝 License

This project is for educational and demonstration purposes.

## 👨‍💻 Author

HRMS Lite - Full Stack HR Management System

