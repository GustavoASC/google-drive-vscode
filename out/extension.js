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
    require('dotenv').config();
    // const authenticator = new DriveAuthenticator();
    const controller = new driveController_1.DriveController();
    const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    myStatusBarItem.text = '$(sign-in) Google Drive: Click to sign-in';
    subscriptions.push(myStatusBarItem);
    myStatusBarItem.show();
    // subscriptions.push(vscode.commands.registerCommand('google.drive.auth', () => {
    // 	authenticator.authenticate();
    // }));
    subscriptions.push(vscode.commands.registerCommand('google.drive.fetchFiles', () => {
        controller.listFiles('root');
    }));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map