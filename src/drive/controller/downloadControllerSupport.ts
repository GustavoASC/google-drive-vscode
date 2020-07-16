import { DriveModel } from "../model/driveModel";
import { DriveView } from "../view/driveView";

export class DownloadControllerSupport {

    constructor(private model: DriveModel, private view: DriveView) { }

    downloadFile(fileId: string): void {
        const driveFileName = this.model.getDriveFile(fileId)?.name;
        this.view.askForLocalDestinationFolder(driveFileName)
            .then(destinationFile => {
                const downloadPromise = this.createDownloadPromise(fileId, destinationFile);
                this.view.showProgressMessage('Downloading file from Google Drive. Please wait...', downloadPromise);
            }).catch(() => this.view.showWarningMessage(`'Download file' process canceled by user.`));
    }

    private createDownloadPromise(fileId: string, destinationFile: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.model.downloadFile(fileId, destinationFile)
                .then(() => {
                    this.showDownloadFinishedMessage(destinationFile);
                    resolve();
                }).catch(err => {

                    const warningMessage = `A problem happened while downloading file. Message: '${err}'`;

                    this.view.showWarningMessage(warningMessage);
                    reject(err);
                });
        });
    }

    private showDownloadFinishedMessage(destinationFile: string): void {
        const openFileButton = 'Open file';
        this.view.showInformationMessage(`File successfully downloaded from Drive.`, openFileButton)
            .then((selectedButton) => {
                if (selectedButton === openFileButton) {
                    this.view.openFile(destinationFile);
                }
            });
    }

}
