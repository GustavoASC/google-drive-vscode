import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { CredentialsFactory } from '../../../drive/credentials/credentialsManager';
import { controller } from '../../../extension';
import { EnvCredentialsProvider } from '../../../drive/credentials/envCredentialsProvider';
import { AbstractDriveView } from '../../drive/view/abstractDriveView.test';


// Create a folder on drive root, with current timestamp
// The timestamp will be folder name
const rootTestFolderName = new Date().getMilliseconds().toString();

suite('Operations on real Google Drive API', () => {

    test('General operations on extension', async () => {
        // Only run tests when specific credentials account are configured on env variables
        // to prevent trash files on Drive
        const provider = new CredentialsFactory().createProvider();
        if (provider instanceof EnvCredentialsProvider) {


            // Creates folder on drive root
            controller.changeViewImpl(new CreateRootFolderView());
            vscode.commands.executeCommand('google.drive.createFolder');
            await sleep(5000);


            // Since we have root folder available, we need to
            // fill it with some files
            controller.changeViewImpl(new UploadFileView());
            ['dummyText.txt', 'dog.jpg', 'helloworld.cpp'].forEach(async res => {
                uploadSelectedResource(res);
            });
            await sleep(5000);
            


            // Force list/fetch files from drive
            vscode.commands.executeCommand('google.drive.fetchFiles');
            await sleep(5000);



        } else {
            // When it's CI execution this should never happen!
            // On CI we have credentials configured on env variables
            if (process.env.CI_EXECUTION) {
                assert.fail('CI should never look for credentials on OS vault!');
            }
        }
    });

});

function uploadSelectedResource(resourceName: string): void {
    const uri = vscode.Uri.file(__dirname + 'res/' + resourceName);
    vscode.commands.executeCommand('google.drive.uploadSelectedFile', uri);
}


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

    showInputBox(message: string, value?: string | undefined): Thenable<string | undefined> {
        return new Promise(resolve => {
            return resolve(rootTestFolderName);
        });
    }

}

class UploadFileView extends AbstractDriveView {

    askForRemoteDestinationFolder(): Promise<string | undefined> {
        return new Promise(resolve => resolve())
    }

}


