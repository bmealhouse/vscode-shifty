/* eslint-disable import/no-named-as-default-member */
import vscode from "vscode";
import sinon from "sinon";

import { handleDidChangeConfiguration as handleDidChangeColorThemeConfiguration } from "../color-themes";
import { handleDidChangeConfiguration as handleDidChangeFontFamilyConfiguration } from "../font-families";

export function setupTest() {
  return {
    executeCommandSpy: sinon.spy(vscode.commands, "executeCommand"),
    showInformationMessaageSpy: sinon.spy(
      vscode.window,
      "showInformationMessage",
    ),

    getFavoriteColorThemes() {
      const config = vscode.workspace.getConfiguration("shifty.colorThemes");
      return config.get<string[]>("favoriteColorThemes", []);
    },

    getIgnoreColorThemes() {
      const config = vscode.workspace.getConfiguration("shifty.colorThemes");
      return config.get<string[]>("ignoreColorThemes", []);
    },

    async seedConfig(section: string, value: unknown) {
      const [sectionKey, ...sectionParts] = section.split(".").reverse();
      const config = vscode.workspace.getConfiguration(
        sectionParts.reverse().join("."),
      );

      await config.update(sectionKey, value, vscode.ConfigurationTarget.Global);
    },

    async updateConfig(section: string, value: unknown) {
      const [sectionKey, ...sectionParts] = section.split(".").reverse();
      const config = vscode.workspace.getConfiguration(
        sectionParts.reverse().join("."),
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
    },
  };
}
