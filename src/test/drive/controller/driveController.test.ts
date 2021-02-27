import { expect } from 'chai';
import 'mocha';
import { DriveModel } from '../../../drive/model/driveModel';
import { DriveController } from '../../../drive/controller/driveController';
import { EmptyMockFileProvider } from '../model/abstractFileProvider.test';
import { DRIVE_SCHEME } from '../../../drive/fileSystem/fileSystemConstants';
import { AbstractDriveView } from '../view/abstractDriveView.test';
import { IClipboardProvider } from '../../../drive/controller/clipboardProvider';
import { DriveFile, FileType } from '../../../drive/model/driveTypes';
import { AbstractMockFileProvider } from '../model/abstractFileProvider.test';

describe('Drive controller operations', () => {

    it('Uploads file with invalid scheme', () => {
        const model = new DriveModel(new EmptyMockFileProvider());
        const view = new WrongSchemeDriveView();
        const controller = new DriveController(model, view);
        controller.uploadFileAndAskFolder(DRIVE_SCHEME, './extension.ts');
        expect(true).to.equal(view.warningShown);
    });

    it('Uploads file with valid scheme but user canceled', () => {
        const model = new DriveModel(new EmptyMockFileProvider());
        const view = new UploadCanceledDriveView();
        const controller = new DriveController(model, view);
        controller.uploadFileAndAskFolder('file://', './extension.ts');
    });

    it('Copies URL to clipboard', async () => {
        const model = new DriveModel(new MockFileProvider());
        await model.listFiles('root');
        const view = new UrlCopiedView();
        const controller = new DriveController(model, view);
        const clipboardProvider = new DummyClipboardProvider();
        view.viewMessage = '';
        controller.copyUrlToClipboard(clipboardProvider, '1Cdffsdfsdfsdfdfocz');
        expect('Remote URL copied to clipboard.').to.equal(view.viewMessage);
        expect('https://drive.google.com/file/d/1Cdffsdfsdfsdfdfocz').to.equal(clipboardProvider.clipboard);
        view.viewMessage = '';
        controller.copyUrlToClipboard(clipboardProvider, '1C7udIKXCkxsvXO37gCBpfaasqn9wocz');
        expect('Remote URL copied to clipboard.').to.equal(view.viewMessage);
        expect('https://drive.google.com/drive/folders/1C7udIKXCkxsvXO37gCBpfaasqn9wocz').to.equal(clipboardProvider.clipboard);
    });

});

class UrlCopiedView extends AbstractDriveView {

    viewMessage : string = "";

    showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
        return new Promise((resolve, reject) => {
            this.viewMessage = message;
            resolve('test');
        });
    }

}

class DummyClipboardProvider implements IClipboardProvider {

    clipboard: string = "";
    
    writeToClipboard(text: string): void {
        this.clipboard = text;
    }

}

class MockFileProvider extends AbstractMockFileProvider {

    provideFiles(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve) => {
            const firstFolder: DriveFile = { iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXadsdssdsadsadsddsocz', name: 'VSCode', type: FileType.DIRECTORY, size: 0, createdTime: 1341393000000, modifiedTime: 1341393000000 };
            const secondFolder: DriveFile = { iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXCkxsvXO37gvfbfbdfbHihn9wocz', name: 'subFolder', type: FileType.DIRECTORY, parent: firstFolder, size: 0, createdTime: 1341393000000, modifiedTime: 1341393000000 };
            const thirdFolder: DriveFile = { iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXCkxsvXO37gCBpfaasqn9wocz', name: 'thirdFolder', type: FileType.DIRECTORY, parent: secondFolder, size: 0, createdTime: 1341393000000, modifiedTime: 1341393000000 };
            const finalFile: DriveFile = { iconLink: 'http://www.mylink.com/file', id: '1Cdffsdfsdfsdfdfocz', name: 'myFile.txt', type: FileType.FILE, parent: secondFolder, size: 1325, createdTime: 1341393000000, modifiedTime: 1341393000000 };
            resolve([thirdFolder, finalFile]);
        });
    }

}


class WrongSchemeDriveView extends AbstractDriveView {

    warningShown = false;

    showWarningMessage(message: string): void {
        this.warningShown = true;
        expect(`It's not possible to proceed with upload operation since file is already on Google Drive.`).to.equal(message);
    }

}

class UploadCanceledDriveView extends AbstractDriveView {

    warningShown = false;

    askForRemoteDestinationFolder(): Promise<string | undefined> {
        return new Promise(resolve => {
            resolve(undefined);
        })
    }

    showWarningMessage(message: string): void {
        this.warningShown = true;
        expect(`'Upload file' process canceled by user.`).to.equal(message);
    }

}