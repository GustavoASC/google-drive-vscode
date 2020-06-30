import { DriveView } from "./driveView";
import { DriveModel } from "./driveModel";
import { DriveFile } from "./driveTypes";

export class DriveController {

	private model: DriveModel = new DriveModel();
	private view: DriveView = new DriveView(this.model);

	listFiles(parentFolderId: string): void {
		this.model.listFiles(parentFolderId)
			.then(_files => this.view.refresh())
			.catch(err => this.view.showUnexpectedErrorMessage(err));
	}

}
