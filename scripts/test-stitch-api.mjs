const apiKey = process.env.STITCH_API_KEY || "";
const url = "https://stitch.googleapis.com/mcp";

async function test() {
  console.log("Testing Stitch endpoint...");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {}
      })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text.substring(0, 500));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

test();
