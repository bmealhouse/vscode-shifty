import vscode from "vscode";
import { getMonospaceFonts } from "node-monospace-fonts";

import { commandMap, DEFAULT_FONT_FAMILY } from "./constants";
import { getRandomItem } from "./utils";
// import { getRandomItem, localeCompare, unique } from "../utils";

let cache: string[];
let nextFontFamily: string;

export const getRawCache = () => cache;

export function activateFontFamilies(context: vscode.ExtensionContext): void {
  cache = getCache();
  nextFontFamily = getNextFontFamily();

  context.subscriptions.push(
    vscode.commands.registerCommand(commandMap.SHIFT_FONT_FAMILY, async () => {
      await shiftFontFamily();
      await vscode.commands.executeCommand(commandMap.RESET_SHIFT_INTERVAL);
    }),
    vscode.commands.registerCommand(
      commandMap.TOGGLE_FAVORITE_FONT_FAMILY,
      async () => {
        // const fontFamily = getFontFamily();
        // if (hasFavoritedFontFamily(fontFamily)) {
        //   await unfavoriteFontFamily(fontFamily);
        //   vscode.window.showInformationMessage(
        //     `Removed "${fontFamily}" from favorites`
        //   );
        // } else {
        //   await favoriteFontFamily(fontFamily);
        //   vscode.window.showInformationMessage(
        //     `Added "${fontFamily}" to favorites`
        //   );
        // }
      }
    ),
    vscode.commands.registerCommand(commandMap.IGNORE_FONT_FAMILY, async () => {
      // const fontFamily = getFontFamily();
      // await ignoreFontFamily(fontFamily);
      // vscode.window.showInformationMessage(`Ignored "${fontFamily}"`);
      // vscode.commands.executeCommand(commandMap.RESET_SHIFT_INTERVAL);
    }),
    vscode.workspace.onDidChangeConfiguration(handleDidChangeConfiguration)
  );
}

export function handleDidChangeConfiguration(
  event: vscode.ConfigurationChangeEvent
): void {
  if (
    event.affectsConfiguration("shifty.fontFamilies") ||
    event.affectsConfiguration("shifty.shiftMode")
  ) {
    cache = getCache();
  }
}

export async function shiftFontFamily(): Promise<void> {
  await setFontFamily(nextFontFamily);
  nextFontFamily = getNextFontFamily(nextFontFamily);
}

// export function hasFavoritedFontFamily(fontFamily: string): boolean {
//   const favoriteFontFamilies = vscode.workspace
//     .getConfiguration("shifty.fontFamilies")
//     .get<string[]>("favoriteFontFamilies", []);

//   return favoriteFontFamilies.includes(fontFamily);
// }

// export async function favoriteFontFamily(fontFamily: string): Promise<void> {
//   const config = vscode.workspace.getConfiguration("shifty.fontFamilies");
//   const favoriteFontFamilies = config.get<string[]>("favoriteFontFamilies", []);

//   await config.update(
//     "favoriteFontFamilies",
//     unique([...favoriteFontFamilies, fontFamily]).sort(localeCompare),
//     vscode.ConfigurationTarget.Global
//   );
// }

// export async function unfavoriteFontFamily(fontFamily: string): Promise<void> {
//   const config = vscode.workspace.getConfiguration("shifty.fontFamilies");
//   const favoriteFontFamilies = config.get<string[]>("favoriteFontFamilies", []);

//   await config.update(
//     "favoriteFontFamilies",
//     unique(favoriteFontFamilies.filter((ff) => ff !== fontFamily)).sort(
//       localeCompare
//     ),
//     vscode.ConfigurationTarget.Global
//   );
// }

// export async function ignoreFontFamily(fontFamily: string): Promise<void> {
//   const config = vscode.workspace.getConfiguration("shifty.fontFamilies");
//   const favoriteFontFamilies = config.get<string[]>("favoriteFontFamilies", []);
//   const ignoreFontFamilies = config.get<string[]>("ignoreFontFamilies", []);

//   await config.update(
//     "ignoreFontFamilies",
//     unique([...ignoreFontFamilies, fontFamily]).sort(localeCompare),
//     vscode.ConfigurationTarget.Global
//   );

//   await config.update(
//     "favoriteFontFamilies",
//     favoriteFontFamilies.filter((ff) => ff !== fontFamily).sort(localeCompare),
//     vscode.ConfigurationTarget.Global
//   );

//   await shiftFontFamily();
// }

export function getFontFamily(): string {
  const { fontFamily } = vscode.workspace.getConfiguration("editor");
  const [mainFontFamily] = fontFamily.split(",");
  return mainFontFamily.replace(/"/g, "");
}

function getNextFontFamily(currentFontFamily?: string): string {
  const possibleFontFamilies = cache.filter(
    (fontFamily) => fontFamily !== currentFontFamily ?? getFontFamily()
  );
  return getRandomItem(possibleFontFamilies);
}

export async function setFontFamily(fontFamily: string): Promise<void> {
  const fallbackFontFamily = vscode.workspace
    .getConfiguration("shifty.fontFamilies")
    .get<string>("fallbackFontFamily", "");

  const formattedFontFamily = /\s/.test(fontFamily)
    ? `"${fontFamily}"`
    : fontFamily;

  const fontFamilyWithFallback = `${formattedFontFamily}, ${fallbackFontFamily}`;

  const editor = vscode.workspace.getConfiguration("editor");
  await editor.update(
    "fontFamily",
    fallbackFontFamily ? fontFamilyWithFallback : fontFamily,
    vscode.ConfigurationTarget.Global
  );
}

// export function getAvailableFontFamilies(): FontFamily[] {
//   const fontFamily = getFontFamily();
//   return fontFamiliesCache.filter((ff) => ff.id !== fontFamily);
// }

// export function getAllFontFamilies(): FontFamily[] {
//   const { includeFontFamilies } = vscode.workspace.getConfiguration(
//     "shifty.fontFamilies"
//   );

//   return [
//     ...codefaceFontFamilies,
//     ...systemFontFamilies,
//     ...includeFontFamilies.map(
//       (ff: string): FontFamily => ({
//         id: ff,
//         supportedPlatforms: [
//           FontFamilyPlatform.LINUX,
//           FontFamilyPlatform.MAC_OS,
//           FontFamilyPlatform.WINDOWS,
//         ],
//         type: FontFamilyType.USER,
//       })
//     ),
//   ];
// }

function getCache(): string[] {
  const {
    shiftMode,
    fontFamilies: {
      favoriteFontFamilies,
      ignoreCodefaceFontFamilies, // remove setting
      ignoreFontFamilies,
      includeFontFamilies,
    },
  } = vscode.workspace.getConfiguration("shifty");

  const allFontFamilies: string[] = getMonospaceFonts();

  if (shiftMode === "favorites") {
    return allFontFamilies.filter((fontFamily) =>
      favoriteFontFamilies.includes(fontFamily)
    );
  }

  let fontFamiliesCache = allFontFamilies.filter(
    (fontFamily) =>
      !(
        ignoreFontFamilies.includes(fontFamily) ||
        (shiftMode === "discovery" && favoriteFontFamilies.includes(fontFamily))
      )
  );

  if (fontFamiliesCache.length === 0) {
    fontFamiliesCache = allFontFamilies.filter((fontFamily) =>
      favoriteFontFamilies.includes(fontFamily)
    );
  }

  if (fontFamiliesCache.length === 0) {
    fontFamiliesCache = [DEFAULT_FONT_FAMILY];
  }

  return fontFamiliesCache;
}
