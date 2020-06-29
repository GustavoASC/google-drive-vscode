// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DriveController } from './drive/driveController';
import { DriveAuthenticator } from './auth/driveAuthenticator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({ subscriptions }: vscode.ExtensionContext) {

	require('dotenv').config();

	const authenticator = new DriveAuthenticator();
	const controller = new DriveController();


	const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	myStatusBarItem.text = '$(sign-in) Google Drive: Click to sign-in';
	subscriptions.push(myStatusBarItem);

	myStatusBarItem.show();

	subscriptions.push(vscode.commands.registerCommand('google.drive.auth', () => {
		authenticator.authenticate();
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.fetchFiles', () => {
		authenticator.authenticate()
			.then((auth) => controller.listFiles(auth))
			.catch(err => vscode.window.showWarningMessage(err));
	}));

}

// this method is called when your extension is deactivated
export function deactivate() { }
