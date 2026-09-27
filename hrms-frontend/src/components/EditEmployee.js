import React, { useState } from "react";
import { updateEmployee } from "../api";

function EditEmployee({ employee, refreshEmployees, close }) {

  const [form, setForm] = useState({
    employee_id: employee.employee_id || "",
    name: employee.name || "",
    email: employee.email || "",
    salary: employee.salary || "",
    department_id: employee.department_id || ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.employee_id?.trim()) {
      newErrors.employee_id = "Employee ID is required";
    }
    if (!form.name?.trim()) {
      newErrors.name = "Name is required";
    }
    if (!form.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    updateEmployee(employee.id, {
      employee_id: form.employee_id.trim(),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      salary: form.salary || 0,
      department_id: form.department_id || null
    })
      .then(() => {
        alert("Employee Updated Successfully!");
        refreshEmployees();
        close();
      })
      .catch((err) => {
        alert(err.message || "Failed to update employee");
      });
  };

  return (

    <div style={overlay}>

      <div style={modal}>

        <h2>Edit Employee</h2>

        <form onSubmit={handleSubmit}>
          
          <div>
            <label style={labelStyle}>Employee ID *</label>
            <input
              name="employee_id"
              value={form.employee_id}
              onChange={handleChange}
              style={errors.employee_id ? {...input, borderColor: "red"} : input}
              placeholder="Employee ID"
            />
            {errors.employee_id && <span style={errorStyle}>{errors.employee_id}</span>}
          </div>

          <div>
            <label style={labelStyle}>Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              style={errors.name ? {...input, borderColor: "red"} : input}
              placeholder="Name"
            />
            {errors.name && <span style={errorStyle}>{errors.name}</span>}
          </div>

          <div>
            <label style={labelStyle}>Email *</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              style={errors.email ? {...input, borderColor: "red"} : input}
              placeholder="Email"
            />
            {errors.email && <span style={errorStyle}>{errors.email}</span>}
          </div>

          <div>
            <label style={labelStyle}>Salary</label>
            <input
              name="salary"
              type="number"
              value={form.salary}
              onChange={handleChange}
              style={input}
              placeholder="Salary"
            />
          </div>

          <div>
            <label style={labelStyle}>Department ID</label>
            <input
              name="department_id"
              type="number"
              value={form.department_id}
              onChange={handleChange}
              style={input}
              placeholder="Department ID"
            />
          </div>

          <div style={buttonContainer}>
            <button type="submit" style={saveBtn}>Save</button>
            <button
              type="button"
              style={cancelBtn}
              onClick={close}
            >
              Cancel
            </button>
          </div>

        </form>

      </div>

    </div>

  );
}

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modal = {
  background: "white",
  padding: "30px",
  borderRadius: "10px",
  width: "400px"
};

const labelStyle = {
  display: "block",
  marginTop: "10px",
  fontWeight: "bold"
};

const input = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  boxSizing: "border-box"
};

const errorStyle = {
  color: "red",
  fontSize: "12px"
};

const buttonContainer = {
  marginTop: "20px",
  display: "flex",
  gap: "10px"
};

const saveBtn = {
  background: "#2ecc71",
  color: "white",
  border: "none",
  padding: "10px 20px",
  cursor: "pointer"
};

const cancelBtn = {
  background: "#aaa",
  color: "white",
  border: "none",
  padding: "10px 20px",
  cursor: "pointer"
};

export default EditEmployee;
