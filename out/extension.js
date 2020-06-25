"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const driveManagement_1 = require("./drive/driveManagement");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const controller = new driveManagement_1.DriveController();
    let disposable = vscode.commands.registerCommand('google.drive.fetchFiles', () => {
        controller.fetchFiles();
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map