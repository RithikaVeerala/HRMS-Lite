const http = require("http");

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testAPI() {
  console.log("Testing API...\n");

  try {
    // Test GET /api/employees
    console.log("1. GET /api/employees");
    const employees = await makeRequest("GET", "/api/employees");
    console.log("Success:", employees.success);
    console.log("Count:", employees.count);
    console.log("First employee:", employees.data?.[0]);
    console.log();

    // Test GET /api/attendance
    console.log("2. GET /api/attendance");
    const attendance = await makeRequest("GET", "/api/attendance");
    console.log("Success:", attendance.success);
    console.log("Count:", attendance.count);
    console.log("Data:", attendance.data);
    console.log("Error:", attendance.error);
    console.log();

    // Test POST /api/attendance
    console.log("3. POST /api/attendance (mark attendance for employee 9)");
    const markResult = await makeRequest("POST", "/api/attendance", {
      employee_id: 9,
      date: "2026-03-05",
      status: "Present",
    });
    console.log("Success:", markResult.success);
    console.log("Message:", markResult.message);
    console.log("Error:", markResult.error);
    console.log();

  } catch (err) {
    console.error("Request error:", err.message);
  }
}

testAPI();

