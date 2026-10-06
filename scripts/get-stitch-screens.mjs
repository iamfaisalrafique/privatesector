const apiKey = process.env.STITCH_API_KEY || "";
const url = "https://stitch.googleapis.com/mcp";
const projectId = "3778423755897913498";

async function rpc(method, params) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: method,
        arguments: params
      }
    })
  });
  const data = await res.json();
  return data.result;
}

async function main() {
  const screens = await rpc("list_screens", { projectId });
  console.log("Screens in project:", JSON.stringify(screens, null, 2));
}

main().catch(console.error);
