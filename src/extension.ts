// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DriveController } from './drive/driveController';
import { DriveModel } from './drive/driveModel';
import { GoogleDriveFileProvider } from './drive/googleDriveFileProvider';
import { DriveAuthenticator } from './auth/driveAuthenticator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({ subscriptions }: vscode.ExtensionContext) {

	const model = new DriveModel(new GoogleDriveFileProvider())
	const controller = new DriveController(model);

	subscriptions.push(vscode.commands.registerCommand('google.drive.configureCredentials', () => {
		configureCredentials();
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.fetchFiles', () => {
		listFiles(controller);
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.uploadOpenFile', () => {
		uploadOpenFile(controller);
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.createFolder', async (parentId: string) => {
		return createFolder(parentId, controller);
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.uploadSelectedFile', (selectedFileId: any) => {
		return uploadSelectedFile(selectedFileId, controller);
	}));
}

function configureCredentials(): void {
	vscode.window.showInformationMessage('Please select the credentials.json file previously generated from your Google API Console.')
	vscode.window.showOpenDialog({}).then(files => {
		if (files && files.length > 0) {
			const selectedCredentialsFile = files[0].fsPath;
			new DriveAuthenticator().storeApiCredentials(selectedCredentialsFile)
				.then(() => vscode.window.showInformationMessage('Credentials successfully stored!'))
				.catch(err => vscode.window.showErrorMessage(err));
		}
	});
}

function listFiles(controller: DriveController): void {
	controller.listFiles('root');
}

async function createFolder(parentId: string, controller: DriveController): Promise<void> {
	return controller.createFolder(parentId);
}

function uploadOpenFile(controller: DriveController): Thenable<any> {
	const fileName = vscode.window.activeTextEditor?.document.fileName;
	if (fileName) {
		return controller.uploadFile(fileName);
	} else {
		return vscode.window.showWarningMessage("There is no file open to upload to Drive.");
	}
}

function uploadSelectedFile(selectedFileId: any, controller: DriveController): Thenable<any> {
	if (selectedFileId && selectedFileId.path) {
		return controller.uploadFile(selectedFileId.path);
	} else {
		return vscode.window.showInformationMessage('Please select a file on Explorer view, which will be uploaded to Google Drive.');
	}
}


// this method is called when your extension is deactivated
export function deactivate() { }
