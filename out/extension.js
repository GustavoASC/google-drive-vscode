"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const driveManagement_1 = require("./drive/driveManagement");
const googleDriveAuthenticator_1 = require("./auth/googleDriveAuthenticator");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    require('dotenv').config();
    vscode.window.showInformationMessage(`api key: ${process.env.API_KEY}`);
    const controller = new driveManagement_1.DriveController();
    context.subscriptions.push(vscode.commands.registerCommand('google.drive.auth', () => {
        new googleDriveAuthenticator_1.GoogleDriveAuthenticator().authenticate();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('google.drive.fetchFiles', () => {
        controller.fetchFiles();
    }));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map