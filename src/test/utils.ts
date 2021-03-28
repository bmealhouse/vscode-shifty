import vscode from "vscode";

import { handleDidChangeConfiguration as handleDidChangeColorThemeConfiguration } from "../color-themes";
import { handleDidChangeConfiguration as handleDidChangeFontFamilyConfiguration } from "../font-families";

export async function updateConfig(section: string, value: any): Promise<void> {
  const [sectionKey, ...sectionParts] = section.split(".").reverse();
  const config = vscode.workspace.getConfiguration(
    sectionParts.reverse().join(".")
  );

  await config.update(sectionKey, value, vscode.ConfigurationTarget.Global);

  const event: vscode.ConfigurationChangeEvent = {
    affectsConfiguration(expectedSection) {
      return section.includes(expectedSection);
    },
  };

  // Simulate configuration change event
  handleDidChangeColorThemeConfiguration(event);
  handleDidChangeFontFamilyConfiguration(event);
}
