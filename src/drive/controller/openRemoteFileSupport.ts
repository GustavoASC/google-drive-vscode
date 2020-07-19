import { DriveModel } from "../model/driveModel";
import { DriveView } from "../view/driveView";
import { IControllerSupport } from "./controllerSupport";
import { RemotePathBuilder } from "../fileSystem/remotePathBuilder";

export class OpenRemoteFileSupport implements IControllerSupport {

    private remotePathBuilder = new RemotePathBuilder();

    fireCommand(model: DriveModel, view: DriveView, fileId: string): void {
        const remotePath = this.remotePathBuilder.buildRemotePathFromId(model, fileId);
        if (remotePath) {
            view.openUri(remotePath);
        } else {
            view.showWarningMessage(`An unexpected error happened and the file with ID ${fileId} could not be opened`);
        }
    }

}
