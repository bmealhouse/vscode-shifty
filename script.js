const mdns = require("multicast-dns")();
const fetch = require("node-fetch");

// const username = "NQLsoJVSMGRYKXGnmCCzQ-7HVtza0tgbulgcFiO1";
const username = "eXRSmKS2Bd1Dl-6uZDGG3GOtU9TSioYxJwQqwM-T";
// "on": true,
// "bri": 254,
// "hue": 8417,
// "sat": 140,

// tokenColors[].name:String & settings.foreground
// tokenColors[].name:Number & settings.foreground
// tokenColors[].name:Keyword & settings.foreground
// tokenColors[].name:Class name & settings.foreground
// tokenColors[].

main();
async function main() {
  const ip = "192.168.0.21";

  // const ip = await discoverHue();
  // console.log(ip);
  // const auth = await authorizeHue(ip);
  // console.log({ auth });

  const response = await fetch(`http://${ip}/api/${username}/groups`);
  const groups = await response.json();

  const group = Object.values(groups).find(
    (group) => group.name.toLowerCase() === "shifty",
  );

  const lights = await Promise.all(
    group.lights.map(async (id) => {
      const response = await fetch(
        `http://${ip}/api/${username}/lights/${id}/state`,
        {
          method: "PUT",
          body: JSON.stringify({
            on: false,
            hue: 150,
            bri: 200,
          }),
        },
      );
      return response.json();
    }),
  );

  console.log(lights);
}

async function authorizeHue(ip) {
  const response = await fetch(`http://${ip}/api`, {
    method: "POST",
    body: JSON.stringify({
      devicetype: "shify#vscode shifty",
    }),
  });

  const [data] = await response.json();

  if (data?.error?.type === 101) {
    console.log("send notification to push button hue bridge");
  } else if (data?.success?.username) {
    console.log(data);
  }
}

function discoverHue() {
  return new Promise((resolve, reject) => {
    const id = setTimeout(reject, 3000);

    mdns.on("response", async (response) => {
      const answer = response.answers.find(
        ({ data }) => typeof data === "string" && data.includes("hue"),
      );

      if (answer) {
        const aRecord = response.additionals.find(
          (additional) => additional.type === "A",
        );

        if (aRecord) {
          const { data: ip } = aRecord;
          const { status } = await fetch(`http://${ip}/api/0/config`);

          if (status === 200) {
            clearTimeout(id);
            mdns.destroy();
            resolve(ip);
          }
        }
      }
    });

    mdns.query("_hap._tcp.local", "PTR");
  });
}
