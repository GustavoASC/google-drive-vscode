import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import { controller, credentialsManager } from '../../../extension';
import { EnvCredentialsProvider } from '../../../drive/credentials/envCredentialsProvider';
import { AbstractDriveView } from '../../drive/view/abstractDriveView.test';
import { CredentialsManager } from '../../../drive/credentials/credentialsManager';
import { DriveAuthenticator } from '../../../auth/driveAuthenticator';
import { GoogleDriveFileProvider } from '../../../drive/model/googleDriveFileProvider';
import { DriveModel } from '../../../drive/model/driveModel';
import { DriveController } from '../../../drive/controller/driveController';
import { uploadSelectedFile } from '../../../extension';
import * as fs from 'fs';

const TIMEOUT_BETWEEN_STEPS = 10000;

// Create a folder on drive root, with current timestamp
// The timestamp will be folder name
const rootTestFolderName = new Date().getMilliseconds().toString();

let openedUri: string | undefined;
suite('Operations on real Google Drive API', () => {

    test('General operations on extension', async () => {
        // Only run tests when specific credentials account are configured on env variables
        // to prevent trash files on Drive
        const envProvider = process.env.DRIVE_CREDENTIALS && process.env.DRIVE_TOKEN
        if (envProvider) {
            
            const credentialsManager = new CredentialsManager(new EnvCredentialsProvider());

            // Prepares the file provider to fetch and manipulate information from Google Drive
            const driveAuthenticator = new DriveAuthenticator(credentialsManager);
            const googleFileProvider = new GoogleDriveFileProvider(driveAuthenticator);
            const model = new DriveModel(googleFileProvider);
            let controller: undefined | DriveController;


            console.log(`Creating folder ${rootTestFolderName} on root...`);
            controller = new DriveController(model, new CreateRootFolderView());
            controller.createFolder('root');
            await sleep(TIMEOUT_BETWEEN_STEPS);

            
            console.log(`Fetching/listing files from root folder on drive...`);
            controller.listFiles('root');
            await sleep(TIMEOUT_BETWEEN_STEPS);


            console.log(`From fetched files, discovering the ID of the folder created moments ago...`);
            const folderId = model.getDriveFileFromName(rootTestFolderName)!.id;
            console.log(`Created folder ${rootTestFolderName} with ID ${folderId} on root`);


            controller = new DriveController(model, new UploadFileView(folderId));
            ['dummyText.txt', 'dog.jpg', 'helloworld.cpp'].forEach(async res => {
                const uri = vscode.Uri.file(__dirname + '/../../../../src/test/integration/suite/res/' + res);
                console.log(`Uploading ${res} to folder created moments ago...`);
                uploadSelectedFile(uri, controller!);
            });
            await sleep(TIMEOUT_BETWEEN_STEPS);

            console.log(`Fetching/listing files from folder with ID ${folderId} on drive...`);
            controller.listFiles(folderId);
            await sleep(TIMEOUT_BETWEEN_STEPS);

            const testFileName = 'dummyText.txt';
            console.log(`Discovering the ID of ${testFileName} on drive...`);
            const dummyTextId = model.getDriveFileFromName(testFileName)!.id;
            console.log(`ID: ${dummyTextId}`);

            console.log('Downloading dummyText.txt on drive...');
            controller = new DriveController(model, new DownloadFileView());
            controller.downloadFile(dummyTextId);
            await sleep(TIMEOUT_BETWEEN_STEPS);
            const destination = vscode.Uri.file(__dirname + '/../../../../src/test/integration/suite/downloaded-dummyText.txt').path
            fs.readFile(destination, (err, data) => {
                assert.equal(data.length, 3750);
                fs.unlinkSync(destination);
            });
            await sleep(TIMEOUT_BETWEEN_STEPS);

            const uri = vscode.Uri.file(__dirname + '/../../../../src/test/integration/suite/res/updatedRes/dummyText.txt');
            console.log('Replacing dummyText.txt ...');
            controller = new DriveController(model, new UploadFileView(folderId));
            uploadSelectedFile(uri, controller!);
            await sleep(TIMEOUT_BETWEEN_STEPS);

            console.log('Downloading replaced dummyText.txt on drive...');
            controller = new DriveController(model, new DownloadFileView());
            controller.downloadFile(dummyTextId);
            await sleep(TIMEOUT_BETWEEN_STEPS);
            fs.readFile(destination, (err, data) => {
                assert.equal(data.length, 400);
                fs.unlinkSync(destination);
            });
            await sleep(TIMEOUT_BETWEEN_STEPS);

            console.log(`Renaming ${testFileName} on drive...`);
            controller = new DriveController(model, new RenameFileView());
            controller.renameFile(dummyTextId);
            await sleep(TIMEOUT_BETWEEN_STEPS);


            console.log(`Opening the remote file with ID ${dummyTextId} on VSCode tab...`);
            controller.openRemoteFile(dummyTextId);
            await sleep(TIMEOUT_BETWEEN_STEPS);

            console.log(`Checking whether opened the right file...`);
            assert.equal(`googledrive:///${rootTestFolderName}/renamed-file.txt#${dummyTextId}`, openedUri);
        } else {
            // When it's CI execution this should never happen!
            // On CI we have credentials configured on env variables
            if (process.env.CI_EXECUTION) {
                assert.fail('CI should always run integration tests!');
            }
        }
    });

});


function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

// ------- Mock view implementations
// -------
// ------- We create mock view implementations because on automated tests we don't
// ------- have anyone to interact with windows

class CreateRootFolderView extends AbstractDriveView {

    refresh(): void {

    }

    showInputBox(message: string, value?: string | undefined): Thenable<string | undefined> {
        return new Promise(resolve => {
            return resolve(rootTestFolderName);
        });
    }

    showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
        return new Promise(resolve => resolve(undefined));
    }

    showWarningMessage(message: string): void {

    }

    showProgressMessage(message: string, task: Thenable<any>): void {

    }

}

class UploadFileView extends AbstractDriveView {

    constructor(private id: string) {
        super();
    }

    askForRemoteDestinationFolder(): Promise<string | undefined> {
        return new Promise(resolve => resolve(this.id));
    }

    refresh(): void {

    }

    showInputBox(message: string, value?: string | undefined): Thenable<string | undefined> {
        return new Promise(resolve => {
            return resolve(rootTestFolderName);
        });
    }

    showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
        return new Promise(resolve => resolve(undefined));
    }

    showWarningMessage(message: string): void {

    }

    showProgressMessage(message: string, task: Thenable<any>): void {

    }

    openUri(targetUri: string): void {
        const options = this.defaultOpenOptions();
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(targetUri), options);
    }

    private defaultOpenOptions(): vscode.TextDocumentShowOptions {
        const options: vscode.TextDocumentShowOptions = {
            viewColumn: vscode.ViewColumn.Active,
            preview: false
        }
        return options;
    }

}

class DownloadFileView extends AbstractDriveView {

    refresh(): void {

    }

    showInputBox(message: string, value?: string | undefined): Thenable<string | undefined> {
        return new Promise(resolve => {
            return resolve('dummyText.txt');
        });
    }

    showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
        return new Promise(resolve => resolve(undefined));
    }

    showWarningMessage(message: string): void {

    }

    showProgressMessage(message: string, task: Thenable<any>): void {

    }

    openUri(targetUri: string): void {
        openedUri = targetUri;
    }

    askForLocalDestinationFolder(suggestedPath?: string | undefined): Promise<string> {
        const path = vscode.Uri.file(__dirname + '/../../../../src/test/integration/suite/downloaded-dummyText.txt').path; 
        return new Promise(resolve => resolve(path));
    }

}

class RenameFileView extends AbstractDriveView {

    refresh(): void {

    }

    showInputBox(message: string, value?: string | undefined): Thenable<string | undefined> {
        return new Promise(resolve => {
            return resolve('renamed-file.txt');
        });
    }

    showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
        return new Promise(resolve => resolve(undefined));
    }

    showWarningMessage(message: string): void {

    }

    showProgressMessage(message: string, task: Thenable<any>): void {

    }

    openUri(targetUri: string): void {
        openedUri = targetUri;
    }

}



