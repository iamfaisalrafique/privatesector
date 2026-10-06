const apiKey = process.env.STITCH_API_KEY || "";
const url = "https://stitch.googleapis.com/mcp";

async function listTools() {
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
  const data = await res.json();
  console.log("Stitch Tools available:");
  for (const t of data.result.tools) {
    console.log(`- ${t.name}: ${t.description.trim().split('\n')[0]}`);
  }
}

listTools();
