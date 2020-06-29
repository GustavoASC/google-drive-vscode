// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DriveController } from './drive/driveController';
import { DriveAuthenticator } from './auth/driveAuthenticator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	require('dotenv').config();

	const authenticator = new DriveAuthenticator();
	const controller = new DriveController(authenticator);

	context.subscriptions.push(vscode.commands.registerCommand('google.drive.auth', () => {
		authenticator.authenticate();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('google.drive.fetchFiles', () => {
		controller.listFiles();
	}));

}

// this method is called when your extension is deactivated
export function deactivate() {}
