import { DriveModel } from "../model/driveModel";
import { DriveView } from "../view/driveView";
import { DriveFileUtils } from "../model/driveTypes";

export class RenameControllerSupport {

    constructor(private model: DriveModel, private view: DriveView) { }

    renameFile(fileId: string): void {
        const driveFile = this.model.getDriveFile(fileId);
        if (driveFile) {
            const typeText = DriveFileUtils.extractTextFromType(driveFile.type);
            const oldName = driveFile.name;
            this.view.showInputBox(`Please type the new ${typeText} name`, oldName)
                .then((newName) => {
                    if (newName && newName !== oldName) {
                        const renamePromise = this.createRenamePromise(fileId, oldName, newName);
                        this.view.showProgressMessage('Renaming file on Google Drive. Please wait...', renamePromise);
                    }
                });
        }
    }

    private createRenamePromise(fileId: string, oldName: string, newName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.model.renameFile(fileId, newName)
                .then(() => {
                    this.view.showInformationMessage(`'${oldName}' successfully renamed to '${newName}' on Drive.`);
                    this.view.refresh();
                    resolve();
                }).catch((err) => {
                    this.view.showWarningMessage(err);
                    reject();
                });
        });
    }

}