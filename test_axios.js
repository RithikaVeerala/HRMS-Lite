// Test that exactly simulates what the frontend does
const http = require("http");

// Simulate axios.create() behavior
const api = {
  get: (path) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "localhost",
        port: 5000,
        path: path,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            // Simulate axios response interceptor - returns response.data
            resolve(parsed); // This is what frontend sees after interceptor
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on("error", reject);
      req.end();
    });
  }
};

// Test what frontend sees
async function test() {
  console.log("=== Testing GET /api/attendance (frontend simulation) ===\n");
  
  try {
    const result = await api.get("/api/attendance");
    
    console.log("What AttendanceList receives:");
    console.log("  result:", JSON.stringify(result, null, 2));
    console.log("\nIn AttendanceList, it does setAttendanceRecords(response.data || response)");
    console.log("  response.data:", result.data);
    console.log("  If response.data exists, it uses that. Otherwise uses response directly.");
    
    // Simulate what happens in AttendanceList
    const records = result.data || result;
    console.log("\nFinal records array:", records);
    
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

test();

