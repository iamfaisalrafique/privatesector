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
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}

async function main() {
  console.log("Generating Homepage Screen in Stitch...");
  const screen1 = await rpc("generate_screen_from_text", {
    projectId: projectId,
    prompt: "Modern Google Material 3 Expressive & Apple polish homepage for Swiss Economic Intelligence platform PrivateSector.ch. Features: Clean white and dark bar with prominent centered pill search input, streamlined tabs (News, Companies, Interviews, Careers, Stats, Rankings), theme toggle, locale selector. Ultra-thin subtle single-line ticker below header showing SMI, EUR/CHF, USD/CHF, Gold. Hero headline banner, quick topic filter pills, modern card masonry layout for top Swiss business news, company directory spotlight, daily audio briefing card, cantonal GDP indicators."
  });
  console.log("Screen 1 generated:", JSON.stringify(screen1, null, 2).substring(0, 1000));
}

main().catch(console.error);
