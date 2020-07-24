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


// Create a folder on drive root, with current timestamp
// The timestamp will be folder name
const rootTestFolderName = new Date().getMilliseconds().toString();

suite('Operations on real Google Drive API', () => {

    test('General operations on extension', async () => {
        // Only run tests when specific credentials account are configured on env variables
        // to prevent trash files on Drive
        const envProvider = process.env['DRIVE_CREDENTIALS'] && process.env['DRIVE_TOKEN']
        if (envProvider) {
            
            const credentialsManager = new CredentialsManager();
            credentialsManager.changeProvider(new EnvCredentialsProvider());


            // Prepares the file provider to fetch and manipulate information from Google Drive cloud
            const driveAuthenticator = new DriveAuthenticator(credentialsManager);
            const googleFileProvider = new GoogleDriveFileProvider(driveAuthenticator);
            const model = new DriveModel(googleFileProvider);
            let controller: undefined | DriveController;


            //
            // Creates folder on drive root
            //
            controller = new DriveController(model, new CreateRootFolderView());
            controller.createFolder('root');
            await sleep(5000);

            
            //
            // Fetch/list files from root folder on cloud
            //
            controller.listFiles('root');
            await sleep(5000);


            //
            // From fetched files, discover the ID of the folder created moments ago
            //
            const folderId = model.getDriveFileFromName(rootTestFolderName)!.id;
            console.log(`Created folder ${rootTestFolderName} with ID ${folderId} on root`);


            //
            // Since we have the folder available, we need to fill it with some files
            //
            controller = new DriveController(model, new UploadFileView(folderId));
            ['dummyText.txt', 'dog.jpg', 'helloworld.cpp'].forEach(async res => {
                const uri = vscode.Uri.file(__dirname + '/../../../../src/test/integration/suite/res/' + res);
                uploadSelectedFile(uri, controller!);
            });
            await sleep(5000);


            //
            // Force list/fetch files from drive
            //
            controller.listFiles(folderId);
            await sleep(5000);


            //
            // Opens the text file on VSCode
            //
            const dummyTextId = model.getDriveFileFromName('dummyText.txt')!.id;
            controller.openRemoteFile(dummyTextId);
            await sleep(5000);


            //
            // Checks whether opened the right file
            //
            assert.equal(`/${rootTestFolderName}/dummyText.txt`, vscode.window.activeTextEditor?.document.fileName);
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


