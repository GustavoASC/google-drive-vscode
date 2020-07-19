import { DriveModel } from "../model/driveModel";
import { DriveView } from "../view/driveView";

export interface IControllerSupport {

    fireCommand(model: DriveModel, view: DriveView, fileId: string): void;

}