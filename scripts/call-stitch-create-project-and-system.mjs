const apiKey = process.env.STITCH_API_KEY || "";
const url = "https://stitch.googleapis.com/mcp";

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
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}

async function main() {
  console.log("Creating Stitch Project...");
  const projResult = await rpc("create_project", {
    title: "PrivateSector Google Material 3 Expressive & Apple Polish Redesign"
  });
  console.log("Project created:", JSON.stringify(projResult, null, 2));

  // Extract project ID
  let projectId = "";
  if (projResult && projResult.content) {
    const text = projResult.content.map(c => c.text).join("");
    const match = text.match(/projects\/([0-9]+)/);
    if (match) projectId = match[1];
  }

  console.log("Extracted Project ID:", projectId);

  if (projectId) {
    console.log("Creating Design System for project in Stitch...");
    const dsResult = await rpc("create_design_system", {
      projectId: projectId,
      designSystem: {
        displayName: "Google Material 3 Expressive - PrivateSector",
        theme: {
          colorMode: "LIGHT",
          colorVariant: "EXPRESSIVE",
          customColor: "#D52B1E",
          headlineFont: "INTER",
          bodyFont: "INTER",
          labelFont: "INTER",
          roundness: "ROUND_TWELVE",
          overridePrimaryColor: "#D52B1E",
          overrideNeutralColor: "#F8FAFC",
          overrideSecondaryColor: "#0F172A"
        }
      }
    });
    console.log("Design System created:", JSON.stringify(dsResult, null, 2));
  }
}

main().catch(console.error);
