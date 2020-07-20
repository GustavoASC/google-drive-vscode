import { DriveModel } from "../model/driveModel";
import { IDriveView } from "../view/driveView";
import { IControllerSupport } from "./controllerSupport";

export class DownloadSupport implements IControllerSupport {

    fireCommand(model: DriveModel, view: IDriveView, fileId: string): void {
        const driveFileName = model.getDriveFile(fileId)?.name;
        view.askForLocalDestinationFolder(driveFileName)
            .then(destinationFile => {
                const downloadPromise = this.createDownloadPromise(model, view, fileId, destinationFile);
                view.showProgressMessage('Downloading file from Google Drive. Please wait...', downloadPromise);
            }).catch(() => view.showWarningMessage(`'Download file' process canceled by user.`));
    }

    private createDownloadPromise(model: DriveModel, view: IDriveView, fileId: string, destinationFile: string): Promise<void> {
        return new Promise((resolve, reject) => {
            model.downloadFile(fileId, destinationFile)
                .then(() => {
                    this.showDownloadFinishedMessage(view, destinationFile);
                    resolve();
                }).catch(err => {
                    const warningMessage = `A problem happened while downloading file. Message: '${err}'`;
                    view.showWarningMessage(warningMessage);
                    reject(err);
                });
        });
    }

    private showDownloadFinishedMessage(view: IDriveView, destinationFile: string): void {
        const openFileButton = 'Open file';
        view.showInformationMessage(`File successfully downloaded from Drive.`, openFileButton)
            .then((selectedButton) => {
                if (selectedButton === openFileButton) {
                    view.openFile(destinationFile);
                }
            });
    }

}
