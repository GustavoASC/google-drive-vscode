// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DriveController } from './drive/driveManagement';
import { GoogleDriveAuthenticator } from './auth/googleDriveAuthenticator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	require('dotenv').config();
	vscode.window.showInformationMessage(`api key: ${process.env.API_KEY}`)

	const controller = new DriveController();

	context.subscriptions.push(vscode.commands.registerCommand('google.drive.auth', () => {
		new GoogleDriveAuthenticator().authenticate();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('google.drive.fetchFiles', () => {
		controller.fetchFiles();
	}));

}

// this method is called when your extension is deactivated
export function deactivate() {}
