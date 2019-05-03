import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

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
    await Promise.all(
      vscode.workspace.workspaceFolders.map(async folder => {
        const defaultSettingsFileLocation = path.resolve(
          folder.uri.path,
          "./.vscode/settings.default.json"
        );
        const settingsFileLocation = path.resolve(
          folder.uri.path,
          "./.vscode/settings.json"
        );
        const defaultSettingsFileExists = await exists(
          defaultSettingsFileLocation
        );
        const currentSettingsFileExists = await exists(settingsFileLocation);
        if (!defaultSettingsFileExists) {
          vscode.window.showInformationMessage(
            "Default Settings File does not exist!"
          );
          return;
        }
        let currentSettings = {};
        if (currentSettingsFileExists) {
          currentSettings = JSON.parse(
            await readFile(settingsFileLocation, { encoding: "utf8" })
          );
        }
        const defaultSettings = JSON.parse(
          await readFile(defaultSettingsFileLocation, { encoding: "utf8" })
        );
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
      })
    );

    vscode.window.showInformationMessage("Workspace Settings Synchronized");
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
