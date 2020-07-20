import { DriveModel } from "../model/driveModel";
import { IDriveView } from "../view/driveView";

export interface IControllerSupport {

    fireCommand(model: DriveModel, view: IDriveView, fileId: string): void;

}