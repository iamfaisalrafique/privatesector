const apiKey = process.env.STITCH_API_KEY || "";
const url = "https://stitch.googleapis.com/mcp";

async function run() {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "list_projects",
        arguments: {}
      }
    })
  });
  const data = await res.json();
  console.log("Projects:", JSON.stringify(data.result, null, 2));
}

run();
