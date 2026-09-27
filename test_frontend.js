const http = require("http");

// Simulate what the frontend axios does
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: path,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3001",  // Simulate frontend origin
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log("Status:", res.statusCode);
        console.log("Headers:", res.headers);
        console.log("Raw Data:", data);
        try {
          const parsed = JSON.parse(data);
          console.log("Parsed:", parsed);
          
          // Simulate axios response interceptor - returns response.data
          // So what the component sees is just the data part
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

async function test() {
  console.log("=== Testing GET /api/attendance ===\n");
  try {
    const result = await makeRequest("/api/attendance");
    console.log("\nFinal result (what frontend sees):");
    console.log("result.success:", result.success);
    console.log("result.count:", result.count);
    console.log("result.data:", result.data);
    console.log("\nIn AttendanceList, it does: response.data || response");
    console.log("If response.data is undefined, it falls back to response which is:", typeof result);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();

