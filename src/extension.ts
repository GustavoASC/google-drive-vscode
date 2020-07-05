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
	subscriptions.push(vscode.commands.registerCommand('google.drive.uploadCurrentFile', () => {
		uploadCurrentFile(controller);
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.createFolder', async (parentId: string) => {
		createFolder(parentId, controller);
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.uploadSelectedFile', (selectedFileId: any) => {
		uploadSelectedFile(selectedFileId, controller);
	}));
}

async function createFolder(parentId: string, controller: DriveController): Promise<void> {
	const folderName = await vscode.window.showInputBox({ placeHolder: 'Please type the folder name' });
	if (folderName) {
		controller.createFolder(parentId, folderName);
	}
}

function uploadCurrentFile(controller: DriveController): void {
	const fileName = vscode.window.activeTextEditor?.document.fileName;
	if (fileName) {
		controller.uploadFile(fileName);
	} else {
		vscode.window.showWarningMessage("There is no file open to upload to Drive.")
	}
}

function uploadSelectedFile(selectedFileId: any, controller: DriveController): void {
	controller.uploadFile(selectedFileId.path);
}


// this method is called when your extension is deactivated
export function deactivate() { }
