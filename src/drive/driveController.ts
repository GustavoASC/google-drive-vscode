import { DriveView } from "./driveView";
import { DriveModel } from "./driveModel";

export class DriveController {

	private model: DriveModel = new DriveModel();
	private view: DriveView = new DriveView(this.model);

	listFiles(parentFolderId: string): void {
		this.model.listFiles(parentFolderId)
			.then(_files => this.view.refresh())
			.catch(err => this.view.showWarningMessage(err));
	}

	createFolder(parentFolderId: string, folderName: string): void {
		this.model.createFolder(parentFolderId, folderName)
			.then(_files => this.view.refresh())
			.catch(err => this.view.showWarningMessage(err));
	}

	uploadFile(fullFileName: string): void {
		this.view.showInformationMessage(`Uploading file to Google Drive...`);
		this.model.uploadFile(fullFileName)
			.then((basename) => {
				this.view.showInformationMessage(`File ${basename} successfully uploaded to Google Drive.`);
				this.view.refresh();
			}).catch(err => this.view.showWarningMessage(err));
	}

}
