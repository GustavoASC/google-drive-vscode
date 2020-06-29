"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const driveController_1 = require("./drive/driveController");
const driveAuthenticator_1 = require("./auth/driveAuthenticator");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    require('dotenv').config();
    const authenticator = new driveAuthenticator_1.DriveAuthenticator();
    const controller = new driveController_1.DriveController(authenticator);
    context.subscriptions.push(vscode.commands.registerCommand('google.drive.auth', () => {
        authenticator.authenticate();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('google.drive.fetchFiles', () => {
        controller.listFiles();
    }));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map