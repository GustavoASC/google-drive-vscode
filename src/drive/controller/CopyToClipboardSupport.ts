import { DriveModel } from "../model/driveModel";
import { IDriveView } from "../view/driveView";
import { IControllerSupport } from "./controllerSupport";
import { RemoteUrlBuilder } from "../model/driveUrlBuilder";
import { IClipboardProvider } from "./clipboardProvider";

export class CopyToClipboardSupport implements IControllerSupport {

    private builder = new RemoteUrlBuilder();

    constructor(private provider: IClipboardProvider) {};

    fireCommand(model: DriveModel, view: IDriveView, fileId: string): void {
        const url = this.builder.buildUrlFromId(model, fileId);
        if (url) {
            this.provider.writeToClipboard(url);
            view.showInformationMessage('Remote URL copied to clipboard.')
        }
    }

}
