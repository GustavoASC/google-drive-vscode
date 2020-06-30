// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DriveController } from './drive/driveController';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({ subscriptions }: vscode.ExtensionContext) {

	const controller = new DriveController();

	subscriptions.push(vscode.commands.registerCommand('google.drive.fetchFiles', () => {
		controller.listFiles('root');
	}));
	
	subscriptions.push(buildStatusBar());
}

function buildStatusBar(): vscode.StatusBarItem {
	const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	myStatusBarItem.text = '$(sign-in) Google Drive: Click to sign-in';
	myStatusBarItem.show();
	return myStatusBarItem;
}

// this method is called when your extension is deactivated
export function deactivate() { }
