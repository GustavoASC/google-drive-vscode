import { DriveModel } from "../model/driveModel";
import { DriveView } from "../view/driveView";

export class UploadControllerSupport {

    constructor(private model: DriveModel, private view: DriveView) { }

    uploadFileToFolder(fullFileName: string, folderId: string): void {
        const uploadPromise = this.createUploadPromise(folderId, fullFileName);
        this.view.showProgressMessage('Uploading file to Google Drive. Please wait...', uploadPromise);
    }

    private createUploadPromise(parentID: string, fullFileName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.model.uploadFile(parentID, fullFileName)
                .then((basename) => {
                    this.view.showInformationMessage(`File '${basename}' successfully uploaded to Drive.`);
                    this.view.refresh();
                    resolve();
                }).catch(err => {
                    this.view.showWarningMessage(err);
                    reject(err);
                });
        });
    }

}