import { DriveView } from "./driveView";
import { DriveModel } from "./driveModel";
import { DriveFile } from "./driveTypes";

export class DriveController {

	private model: DriveModel = new DriveModel();
	private view: DriveView = new DriveView(this);

	listFiles(auth: any): void {
		this.model.listFiles(auth)
			.then(_files => this.view.refresh())
			.catch(err => this.view.showUnexpectedErrorMessage(err));
	}

	getAllDriveFileIds(): string[] {
		return this.model.getAllDriveFileIds();
	}

	getAllDriveFiles(): DriveFile[] {
		return this.model.getAllDriveFiles();
	}

	getDriveFile(id: string): DriveFile | undefined {
		return this.model.getDriveFile(id);
	}

}
