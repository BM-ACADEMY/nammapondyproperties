const http = require("http");

function request(url, method = "GET") {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
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
    req.end();
  });
}

async function test() {
  const BASE_URL = "http://localhost:6060";
  try {
    console.log("Fetching properties...");
    const data = await request(
      `${BASE_URL}/properties/fetch-all-property?limit=1`,
    );
    if (!data.properties || data.properties.length === 0) {
      console.log("No properties found.");
      return;
    }
    const propertyId = data.properties[0]._id;
    console.log(`Testing property: ${propertyId}`);

    console.log("Incrementing view count (Attempt 1)...");
    const inc1 = await request(
      `${BASE_URL}/properties/increment-view-count/${propertyId}`,
      "PUT",
    );
    console.log(`View Count 1: ${inc1.view_count}`);

    console.log("Incrementing view count (Attempt 2)...");
    const inc2 = await request(
      `${BASE_URL}/properties/increment-view-count/${propertyId}`,
      "PUT",
    );
    console.log(`View Count 2: ${inc2.view_count}`);

    if (inc1.view_count === inc2.view_count) {
      console.log("SUCCESS: View count did not increment on second attempt.");
    } else {
      console.log("FAILURE: View count incremented on second attempt.");
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
