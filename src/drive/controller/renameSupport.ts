import { DriveModel } from "../model/driveModel";
import { DriveView } from "../view/driveView";
import { DriveFileUtils } from "../model/driveTypes";
import { IControllerSupport } from "./controllerSupport";

export class RenameSupport implements IControllerSupport {

    fireCommand(model: DriveModel, view: DriveView, fileId: string): void {
        const driveFile = model.getDriveFile(fileId);
        if (driveFile) {
            const typeText = DriveFileUtils.extractTextFromType(driveFile.type);
            const oldName = driveFile.name;
            view.showInputBox(`Please type the new ${typeText} name`, oldName)
                .then((newName) => {
                    if (newName && newName !== oldName) {
                        const renamePromise = this.createRenamePromise(model, view, fileId, oldName, newName);
                        view.showProgressMessage('Renaming file on Google Drive. Please wait...', renamePromise);
                    }
                });
        }
    }

    private createRenamePromise(model: DriveModel, view: DriveView, fileId: string, oldName: string, newName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            model.renameFile(fileId, newName)
                .then(() => {
                    view.showInformationMessage(`'${oldName}' successfully renamed to '${newName}' on Drive.`);
                    view.refresh();
                    resolve();
                }).catch((err) => {
                    view.showWarningMessage(err);
                    reject();
                });
        });
    }

}