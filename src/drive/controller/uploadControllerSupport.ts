import { DriveModel } from "../model/driveModel";
import { IDriveView } from "../view/driveView";
import { IControllerSupport } from "./controllerSupport";

export class UploadSupport implements IControllerSupport {

    constructor(private fullFileName: string) { }
    
    fireCommand(model: DriveModel, view: IDriveView, fileId: string): void {
        const uploadPromise = this.createUploadPromise(model, view, fileId);
        view.showProgressMessage('Uploading file to Google Drive. Please wait...', uploadPromise);
    }

    private createUploadPromise(model: DriveModel, view: IDriveView, parentID: string): Promise<void> {
        return new Promise((resolve, reject) => {
            model.uploadFile(parentID, this.fullFileName)
                .then((basename) => {
                    view.showInformationMessage(`File '${basename}' successfully uploaded to Drive.`);
                    view.refresh();
                    resolve();
                }).catch(err => {
                    view.showWarningMessage(err);
                    reject(err);
                });
        });
    }

}