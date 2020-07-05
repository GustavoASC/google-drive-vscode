// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DriveController } from './drive/driveController';
import { DriveModel } from './drive/driveModel';
import { GoogleDriveFileProvider } from './drive/googleDriveFileProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({ subscriptions }: vscode.ExtensionContext) {

	const model = new DriveModel(new GoogleDriveFileProvider())
	const controller = new DriveController(model);

	subscriptions.push(vscode.commands.registerCommand('google.drive.fetchFiles', () => {
		listFiles(controller);
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.uploadOpenFile', () => {
		uploadOpenFile(controller);
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.createFolder', async (parentId: string) => {
		createFolder(parentId, controller);
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.uploadSelectedFile', (selectedFileId: any) => {
		uploadSelectedFile(selectedFileId, controller);
	}));
}

function listFiles(controller: DriveController): void {
	controller.listFiles('root');
}

async function createFolder(parentId: string, controller: DriveController): Promise<void> {
	controller.createFolder(parentId);
}

function uploadOpenFile(controller: DriveController): void {
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
