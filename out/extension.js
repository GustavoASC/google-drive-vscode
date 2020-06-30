"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const driveController_1 = require("./drive/driveController");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate({ subscriptions }) {
    const controller = new driveController_1.DriveController();
    subscriptions.push(vscode.commands.registerCommand('google.drive.fetchFiles', () => {
        controller.listFiles('root');
    }));
    subscriptions.push(buildStatusBar());
}
exports.activate = activate;
function buildStatusBar() {
    const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    myStatusBarItem.text = '$(sign-in) Google Drive: Click to sign-in';
    myStatusBarItem.show();
    return myStatusBarItem;
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map