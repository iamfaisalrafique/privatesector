const apiKey = process.env.STITCH_API_KEY || "";
const url = "https://stitch.googleapis.com/mcp";

async function main() {
  const fs = await import('node:fs');
  // Read task log or query get_project
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "get_project",
        arguments: { name: "projects/3778423755897913498" }
      }
    })
  });
  const data = await res.json();
  fs.writeFileSync('docs/stitch_project_data.json', JSON.stringify(data, null, 2));
  console.log("Saved docs/stitch_project_data.json");
}

main().catch(console.error);
