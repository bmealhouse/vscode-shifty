// if (process.env.NODE_ENV === "test") {
//   void import("./test/mock-vscode-config");
// }

// import fs from "fs/promises";
// import path from "path";
// import fetch from "node-fetch";
import vscode from "vscode";

import { commandMap } from "./constants";
import {
  activateShiftInterval,
  // deactivateShiftInterval,
} from "./shift-interval";
import { activateFontFamilies, shiftFontFamily } from "./font-families";
import { activateColorThemes, shiftColorTheme } from "./color-themes";
import { log } from "./output-channel";
import { activateStatusBar } from "./status-bar";

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  // // heron.firefox-devtools-theme
  // // daylerees.rainglow => Gloom (rainglow)
  // const { extensionPath, packageJSON } =
  //   vscode.extensions.getExtension("daylerees.rainglow") ?? {};
  // const themePath = path.join(
  //   extensionPath!,
  //   packageJSON.contributes.themes.find(
  //     (theme: any) => theme.label === "Gloom (rainglow)",
  //   )!.path,
  // );
  // const contents = await fs.readFile(themePath, "utf8");
  // log(contents);
  // const themeJSON = JSON.parse(contents);
  // const ip = "192.168.0.21";
  // const username = "eXRSmKS2Bd1Dl-6uZDGG3GOtU9TSioYxJwQqwM-T";
  // const response = await fetch(`http://${ip}/api/${username}/groups`);
  // const groups = await response.json();
  // const group: any = Object.values(groups).find(
  //   (group: any) => group.name.toLowerCase() === "shifty",
  // );
  // console.log(group);
  // const lights = await Promise.all(
  //   group.lights.map(async (id: string) => {
  //     const response = await fetch(`http://${ip}/api/${username}/lights/${id}`);
  //     const data = await response.json();
  //     return {
  //       id,
  //       ...data,
  //     };
  //   }),
  // );
  // console.log(lights);
  // await Promise.all(
  //   lights.map(async (light: any) => {
  //     const {
  //       id,
  //       name,
  //       capabilities: {
  //         control: { colorgamut },
  //       },
  //     } = light;
  //     let color = "";
  //     if (name.startsWith("editor.")) {
  //       color = themeJSON.colors[name];
  //     } else {
  //       for (const tokenColor of themeJSON.tokenColors) {
  //         if (
  //           (Array.isArray(tokenColor.scope) &&
  //             tokenColor.scope.includes(name)) ||
  //           (typeof tokenColor.scope === "string" && tokenColor.scope === name)
  //         ) {
  //           color = tokenColor?.settings?.foreground;
  //         }
  //       }
  //     }
  //     const rgb = hexToRgb(color);
  //     const { x, y, brightness } = rgbToXy(colorgamut, rgb);
  //     const response = await fetch(
  //       `http://${ip}/api/${username}/lights/${id as string}/state`,
  //       {
  //         method: "PUT",
  //         body: JSON.stringify({
  //           on: true,
  //           xy: [x, y],
  //           bri: brightness * 255,
  //         }),
  //       },
  //     );
  //     return response.json();
  //   }),
  // );

  // activateStatusBar(context);
  void activateShiftInterval(context);
  activateColorThemes(context);
  // activateFontFamilies(context);

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.shift, async () => {
      // await Promise.all([shiftFontFamily(), shiftColorTheme()]);
      // await vscode.commands.executeCommand(commandMap.restartShiftInterval);
    }),
  );
}

export async function deactivate(): Promise<void> {
  // await deactivateShiftInterval();
}

// function hexToRgb(hex: string) {
//   log({ hex });
//   let r = 0;
//   let g = 0;
//   let b = 0;

//   if (hex.length === 4) {
//     // 3 digits
//     r = Number(`0x${hex[1]}${hex[1]}`);
//     g = Number(`0x${hex[2]}${hex[2]}`);
//     b = Number(`0x${hex[3]}${hex[3]}`);
//   } else if (hex.length === 7) {
//     // 6 digits
//     r = Number(`0x${hex[1]}${hex[2]}`);
//     g = Number(`0x${hex[3]}${hex[4]}`);
//     b = Number(`0x${hex[5]}${hex[6]}`);
//   }

//   return { r, g, b };
// }

// function rgbToXy(_colorgamut: any, rgb: any) {
//   // get the RGB values from your color object and convert them to be
//   // between 0 and 1
//   const r1 = rgb.r / 255;
//   const g1 = rgb.g / 255;
//   const b1 = rgb.b / 255;

//   // apply a gamma correction to the RGB values, which makes the color more
//   // vivid and more the like the color displayed on the screen of your device
//   const red = r1 > 0.04045 ? (r1 + 0.055) / (1 + 0.055) ** 2.4 : r1 / 12.92;
//   const green = g1 > 0.04045 ? (g1 + 0.055) / (1 + 0.055) ** 2.4 : g1 / 12.92;
//   const blue = b1 > 0.04045 ? (b1 + 0.055) / (1 + 0.055) ** 2.4 : b1 / 12.92;

//   // convert the RGB values to XYZ using the Wide RGB D65 conversion formula
//   const X = red * 0.4124 + green * 0.3576 + blue * 0.1805;
//   const Y = red * 0.2126 + green * 0.7152 + blue * 0.0722;
//   const Z = red * 0.0193 + green * 0.1192 + blue * 0.9505;

//   // calculate the xy values from the XYZ values
//   const x = X / (X + Y + Z);
//   const y = Y / (X + Y + Z);
//   const brightness = Y;

//   // check if the found xy value is within the color gamut of the light
//   return { x, y, brightness };
// }
