import { DriveView } from "./driveView";
import { DriveModel } from "./driveModel";
import { DriveFile } from "./driveTypes";
import { DriveAuthenticator } from "../auth/driveAuthenticator";

export class DriveController {

	private model: DriveModel = new DriveModel(this.authenticator);
	private view: DriveView = new DriveView(this);

	constructor(private authenticator: DriveAuthenticator) { }

	listFiles(): void {
		this.model.listFiles()
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
