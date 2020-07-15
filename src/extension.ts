// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DriveController } from './drive/controller/driveController';
import { DriveModel } from './drive/model/driveModel';
import { GoogleDriveFileProvider } from './drive/model/googleDriveFileProvider';
import { DriveAuthenticator } from './auth/driveAuthenticator';
import { CredentialsConfigurator } from './credentialsConfigurator';

export const CONFIGURE_CREDENTIALS_COMMAND = 'google.drive.configureCredentials';
export const CREATE_FOLDER_COMMAND = 'google.drive.createFolder';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({ subscriptions }: vscode.ExtensionContext) {

	const driveAuthenticator = new DriveAuthenticator();
	const credentialsConfigurator = new CredentialsConfigurator(driveAuthenticator);
	const googleFileProvider = new GoogleDriveFileProvider(driveAuthenticator);
	const model = new DriveModel(googleFileProvider);
	const controller = new DriveController(model);

	subscriptions.push(vscode.commands.registerCommand(CONFIGURE_CREDENTIALS_COMMAND, () => {
		credentialsConfigurator.configureCredentials();
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.fetchFiles', () => {
		controller.listFiles('root');
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.uploadOpenFile', () => {
		uploadOpenFile(controller);
	}));
	subscriptions.push(vscode.commands.registerCommand(CREATE_FOLDER_COMMAND, async (parentId: string | undefined) => {
		controller.createFolder(parentId);
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.uploadSelectedFile', (selectedFileId: any) => {
		uploadSelectedFile(selectedFileId, controller);
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.uploadToFolderSelectedOnView', (selectedFolderId: any) => {
		uploadToFolderSelectedOnView(selectedFolderId, controller);
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.download', (selectedFileId: any) => {
		downloadSelectedFile(selectedFileId, controller);
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.rename', (selectedFileId: any) => {
		renameSelectedFile(selectedFileId, controller);
	}));

	credentialsConfigurator.checkCredentialsConfigured();
}

function uploadOpenFile(controller: DriveController): Thenable<any> {
	const fileName = vscode.window.activeTextEditor?.document.fileName;
	if (fileName) {
		return controller.uploadFileAndAskFolder(fileName);
	} else {
		return vscode.window.showWarningMessage("There is no file open to upload to Drive.");
	}
}

function uploadSelectedFile(selectedFileId: any, controller: DriveController): Thenable<any> {
	if (selectedFileId && selectedFileId.path) {
		return controller.uploadFileAndAskFolder(selectedFileId.path);
	} else {
		return vscode.window.showInformationMessage('Please select a file on Explorer view, which will be uploaded to Google Drive.');
	}
}

function uploadToFolderSelectedOnView(selectedFolderId: any, controller: DriveController): Thenable<any> | undefined {
	if (selectedFolderId) {
		return vscode.window.showOpenDialog({}).then(files => {
			if (files && files.length > 0) {
				const selectedFile = files[0].fsPath;
				controller.uploadFileToFolder(selectedFile, selectedFolderId);
			}
		});
	}
}

function downloadSelectedFile(selectedFileId: any, controller: DriveController): void {
	if (selectedFileId) {
		controller.downloadFile(selectedFileId);
	} else {
		vscode.window.showWarningMessage('This command can only be directly used from Google Drive view.');
	}
}

function renameSelectedFile(selectedFileId: any, controller: DriveController): void {
	if (selectedFileId) {
		controller.renameFile(selectedFileId);
	} else {
		vscode.window.showWarningMessage('This command can only be directly used from Google Drive view.');
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
