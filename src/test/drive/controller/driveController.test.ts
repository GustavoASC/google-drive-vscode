import { expect } from 'chai';
import 'mocha';
import { DriveModel } from '../../../drive/model/driveModel';
import { DriveController } from '../../../drive/controller/driveController';
import { EmptyMockFileProvider } from '../model/abstractFileProvider.test';
import { DRIVE_SCHEME } from '../../../drive/fileSystem/fileSystemConstants';
import { AbstractDriveView } from '../view/abstractDriveView.test';

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

});

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