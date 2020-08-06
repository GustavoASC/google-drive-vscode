import { DriveModel } from "../model/driveModel";
import { IDriveView } from "../view/driveView";
import { IControllerSupport } from "./controllerSupport";

export class UploadFolderSupport implements IControllerSupport {

    constructor(private fullFileName: string) { }
    
    fireCommand(model: DriveModel, view: IDriveView, fileId: string): void {
        const uploadPromise = this.createUploadPromise(model, view, fileId);
        view.showProgressMessage('Zipping folder and uploading to Google Drive. Please wait...', uploadPromise);
    }

    private createUploadPromise(model: DriveModel, view: IDriveView, parentID: string): Promise<void> {
        return new Promise((resolve, reject) => {
            model.uploadFolder(parentID, this.fullFileName)
                .then((basename) => {
                    view.showInformationMessage(`Folder '${basename}' successfully zipped and uploaded to Drive.`);
                    view.refresh();
                    resolve();
                }).catch(err => {
                    view.showWarningMessage(err);
                    reject(err);
                });
        });
    }

}