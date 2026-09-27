import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import EmployeeTable from "./EmployeeTable";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function Dashboard() {

  const [stats, setStats] = useState({});

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard")
      .then(res => {
        setStats(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const data = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        label: "Today's Attendance",
        data: [
          stats.today_present || 0,
          stats.today_absent || 0
        ],
        backgroundColor: ["#4CAF50", "#F44336"]
      }
    ]
  };

  const cardStyle = {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "220px",
    textAlign: "center",
    boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
    transition: "0.3s"
  };

  return (

    <div style={{display:"flex"}}>

      <Sidebar />

      <div style={{
        flex:1,
        minHeight:"100vh",
        background:"linear-gradient(135deg,#667eea,#764ba2)",
        padding:"40px",
        fontFamily:"Arial"
      }}>

        <h1 style={{
          textAlign:"center",
          color:"white",
          marginBottom:"40px"
        }}>
          HRMS Dashboard
        </h1>

        {/* STAT CARDS */}

        <div style={{
          display:"flex",
          justifyContent:"center",
          gap:"30px",
          flexWrap:"wrap"
        }}>

          <div
            style={cardStyle}
            onMouseEnter={(e)=>e.currentTarget.style.transform="scale(1.05)"}
            onMouseLeave={(e)=>e.currentTarget.style.transform="scale(1)"}
          >
            <h3>Total Employees</h3>
            <h2>{stats.total_employees}</h2>
          </div>

          <div
            style={cardStyle}
            onMouseEnter={(e)=>e.currentTarget.style.transform="scale(1.05)"}
            onMouseLeave={(e)=>e.currentTarget.style.transform="scale(1)"}
          >
            <h3>Departments</h3>
            <h2>{stats.total_departments}</h2>
          </div>

          <div
            style={cardStyle}
            onMouseEnter={(e)=>e.currentTarget.style.transform="scale(1.05)"}
            onMouseLeave={(e)=>e.currentTarget.style.transform="scale(1)"}
          >
            <h3>Present Today</h3>
            <h2>{stats.today_present}</h2>
          </div>

          <div
            style={cardStyle}
            onMouseEnter={(e)=>e.currentTarget.style.transform="scale(1.05)"}
            onMouseLeave={(e)=>e.currentTarget.style.transform="scale(1)"}
          >
            <h3>Absent Today</h3>
            <h2>{stats.today_absent}</h2>
          </div>

        </div>


        {/* CHART */}

        <div style={{
          background:"white",
          padding:"30px",
          borderRadius:"12px",
          marginTop:"50px",
          maxWidth:"650px",
          marginLeft:"auto",
          marginRight:"auto",
          boxShadow:"0px 5px 15px rgba(0,0,0,0.2)"
        }}>
          <h3 style={{textAlign:"center"}}>Attendance Overview</h3>
          <Bar data={data} />
        </div>


        {/* EMPLOYEE TABLE */}

        <EmployeeTable />

      </div>

    </div>
  );
}

export default Dashboard;