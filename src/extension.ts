import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { parse, ParseError } from "jsonc-parser";
import { unset } from "lodash";

const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const COMMAND_NAME = "workspace-default-settings.syncSettings";

export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(COMMAND_NAME, async () => {
    if (!vscode.workspace.workspaceFolders) {
      console.log("Not a workspace folder");
      return;
    }
    let settingsSynced = false;
    const defaultSettingsFileName = vscode.workspace
      .getConfiguration("workspace-default-settings")
      .get("defaultSettingsFileName", "settings.default.json");
    await Promise.all(
      vscode.workspace.workspaceFolders.map(async (folder) => {
        const defaultSettingsFileLocation = path.resolve(
          folder.uri.fsPath,
          "./.vscode",
          defaultSettingsFileName
        );
        const settingsFileLocation = path.resolve(
          folder.uri.fsPath,
          "./.vscode/settings.json"
        );
        const defaultSettingsFileExists = await exists(
          defaultSettingsFileLocation
        );
        const currentSettingsFileExists = await exists(settingsFileLocation);
        if (!defaultSettingsFileExists) {
          return;
        }
        let currentSettings = {};
        if (currentSettingsFileExists) {
          const currentSettingsContent = await readFile(settingsFileLocation, {
            encoding: "utf8",
          });
          const currentSettingsErrors: ParseError[] = [];
          currentSettings = parse(
            currentSettingsContent,
            currentSettingsErrors,
            {
              allowTrailingComma: true,
            }
          );
          if (currentSettingsErrors.length > 0) {
            throw new Error(
              "Failed to parse settings.json. Please make sure it contains correct JSON content."
            );
          }

          const ignoredPaths: string[] = vscode.workspace
            .getConfiguration("workspace-default-settings")
            .get("ignoredPaths", []);

          for (const path of ignoredPaths) {
            unset(currentSettings, path);
          }
        }
        const defaultSettingsContent = await readFile(
          defaultSettingsFileLocation,
          {
            encoding: "utf8",
          }
        );
        const defaultSettingsErrors: ParseError[] = [];
        const defaultSettings = parse(
          defaultSettingsContent,
          defaultSettingsErrors,
          {
            allowTrailingComma: true,
          }
        );
        if (defaultSettingsErrors.length > 0) {
          throw new Error(
            "Failed to parse settings.default.json. Please make sure it contains correct JSON content."
          );
        }
        const mergedSettings = Object.assign(
          {},
          currentSettings,
          defaultSettings
        );
        let indentation = vscode.workspace
          .getConfiguration("workspace-default-settings")
          .get("jsonIndentation", 2);
        await writeFile(
          settingsFileLocation,
          JSON.stringify(mergedSettings, null, indentation),
          { encoding: "utf8" }
        );
        settingsSynced = true;
      })
    );

    if (settingsSynced) {
      vscode.window.showInformationMessage("Workspace Settings Synchronized");
    }
  });

  context.subscriptions.push(disposable);
  if (
    vscode.workspace
      .getConfiguration("workspace-default-settings")
      .get("runOnActivation")
  ) {
    vscode.commands.executeCommand(COMMAND_NAME);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
