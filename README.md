# Workspace Default Settings Plugin for Visual Studio Code

This plugin looks for a `.vscode/settings.default.json` file in the currently opened VSCode workspace,
and automatically merges it into the current workspace settings file.

## Why

When you are working in a team, standardizing the toolset is oftentimes a very important step for the team's success.
Out of the box, VSCode allows teams to version control the `settings.json` file to help out with this.
However, there are a couple of issues with this approach:

- Certain plugins pollude this file by adding their own machine-specific settings in there,
  which should not be tracked by a version control system.
- Sometimes a developer changes a particular settings temporarily,
  and then committed that change by mistake.

This plugin is designed to tackle those issues.

By committing a `.vscode/settings.default.json` file in your version control system,
and putting the `.vscode/settings.json` file in your ignore file (e.g. `.gitignore`, `.hgignore`),
you can make sure that developers will have the team-wide settings applied to their environments.

They still have the flexibility to temporarily deviate from them if necessary, by modifying the `.vscode/settings.json` file.
Those changes are easily reverted by running the VSCode command `Workspace Default Settings: Synchronize Settings`.

## Extension Settings

This extension contributes the following settings:

- `workspace-default-settings.runOnActivation`: Whether the plugin will automatically synchronize the settings on activation.
- `workspace-default-settings.jsonIndentation`: Number of columns for JSON indentation when saving the settings.

## License

MIT
