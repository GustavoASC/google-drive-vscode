// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DriveController } from './drive/controller/driveController';
import { DriveModel } from './drive/model/driveModel';
import { GoogleDriveFileProvider } from './drive/model/googleDriveFileProvider';
import { DriveAuthenticator } from './auth/driveAuthenticator';
import { CredentialsConfigurator } from './credentialsConfigurator';
import { DriveFileSystemProvider } from './drive/fileSystem/driveFileSystemProvider';
import { DRIVE_SCHEME } from './drive/fileSystem/fileSystemConstants';
import { DriveView } from './drive/view/driveView';
import { CredentialsManager } from './drive/credentials/credentialsManager';
import { VscodeClipboardProvider } from './vscodeClipboardProvider';

export const CONFIGURE_CREDENTIALS_COMMAND = 'google.drive.configureCredentials';
export const CREATE_FOLDER_COMMAND = 'google.drive.createFolder';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({ subscriptions }: vscode.ExtensionContext) {

	const credentialsManager = new CredentialsManager();

	const driveAuthenticator = new DriveAuthenticator(credentialsManager);
	const credentialsConfigurator = new CredentialsConfigurator(driveAuthenticator);
	const googleFileProvider = new GoogleDriveFileProvider(driveAuthenticator);
	const model = new DriveModel(googleFileProvider);
	const driveView = new DriveView(model);

	const controller = new DriveController(model, driveView);

	vscode.workspace.registerFileSystemProvider(DRIVE_SCHEME, new DriveFileSystemProvider(model), { isReadonly: true });

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
	subscriptions.push(vscode.commands.registerCommand('google.drive.uploadSelectedFile', (selectedFile: any) => {
		uploadSelectedFile(selectedFile, controller);
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
	subscriptions.push(vscode.commands.registerCommand('google.drive.copyurl', (selectedFileId: any) => {
		copyUrlToClipboard(selectedFileId, controller);
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.openFile', (selectedFileId: any) => {
		openRemoteFile(selectedFileId, controller);
	}));
	subscriptions.push(vscode.commands.registerCommand('google.drive.uploadWorkspace', () => {
		uploadWorkspace(controller);
	}));

	credentialsConfigurator.checkCredentialsConfigured();
}

function uploadOpenFile(controller: DriveController): void {
	const fileUri = vscode.window.activeTextEditor?.document.uri;
	if (fileUri) {
		controller.uploadFileAndAskFolder(fileUri.scheme, fileUri.fsPath);
	} else {
		vscode.window.showWarningMessage('There is no file open to upload to Drive.');
	}
}

export function uploadSelectedFile(selectedFile: any, controller: DriveController): void {
	if (selectedFile && selectedFile.scheme && selectedFile.fsPath) {
		controller.uploadFileAndAskFolder(selectedFile.scheme, selectedFile.fsPath);
	} else {
		vscode.window.showInformationMessage('Please select a file on Explorer view, which will be uploaded to Google Drive.');
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

function downloadSelectedFile(selectedFile: any, controller: DriveController): void {
	// Checks whether the command was fired from editor/title bar, once file preview is open
	if (selectedFile instanceof vscode.Uri) {
		controller.downloadFile(selectedFile.fragment);
	} else {
		// Checks whether the command was fired with the file ID, from tree view
		if (selectedFile) {
			controller.downloadFile(selectedFile);
		} else {
			vscode.window.showWarningMessage('This command can only be directly used from Google Drive view.');
		}
	}
}

function renameSelectedFile(selectedFileId: any, controller: DriveController): void {
	if (selectedFileId) {
		controller.renameFile(selectedFileId);
	} else {
		vscode.window.showWarningMessage('This command can only be directly used from Google Drive view.');
	}
}

function copyUrlToClipboard(selectedFileId: any, controller: DriveController): void {
	if (selectedFileId) {
		controller.copyUrlToClipboard(new VscodeClipboardProvider(), selectedFileId);
	} else {
		vscode.window.showWarningMessage('This command can only be directly used from Google Drive view.');
	}
}

function openRemoteFile(selectedFileId: any, controller: DriveController): void {
	if (selectedFileId) {
		controller.openRemoteFile(selectedFileId);
	} else {
		vscode.window.showWarningMessage('This command can only be directly used from Google Drive view.');
	}
}

function uploadWorkspace(controller: DriveController): void {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders && workspaceFolders[0]) {
		const workspace = workspaceFolders[0];
		controller.uploadFolder(workspace.uri.fsPath);
	} else {
		vscode.window.showWarningMessage('Please open a Workspace before using this command.');
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
