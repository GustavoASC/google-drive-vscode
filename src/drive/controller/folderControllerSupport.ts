import { DriveModel } from "../model/driveModel";
import { DriveView } from "../view/driveView";

export class FolderControllerSupport {

    constructor(private model: DriveModel, private view: DriveView) { }

    createFolder(parentFolderId: string): void {
        this.view.showInputBox('Please type the folder name')
            .then((folderName) => {
                if (folderName) {
                    const createFolderPromise = this.createFolderPromise(parentFolderId, folderName);
                    this.view.showProgressMessage(`Creating folder '${folderName}' to Google Drive. Please wait...`, createFolderPromise);
                } else {
                    this.view.showWarningMessage(`'Create folder' process canceled by user.`);
                }
            });
    }

    private createFolderPromise(parentFolderId: string, folderName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.model.createFolder(parentFolderId, folderName)
                .then(_files => {
                    this.view.showInformationMessage(`Folder '${folderName}' successfully created on Drive.`);
                    this.view.refresh();
                    resolve();
                })
                .catch(err => {
                    this.view.showWarningMessage(err);
                    reject(err);
                })
        });
    }

}