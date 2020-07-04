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

	async uploadFile(fullFileName: string): Promise<void> {
		const parentID = await this.view.askForDestinationFolder();
		if (parentID) {
			this.view.showInformationMessage('Uploading file to Google Drive. Please wait...');
			this.model.uploadFile(parentID, fullFileName)
				.then((basename) => {
					this.view.showInformationMessage(`File ${basename} successfully uploaded.`);
					this.view.refresh();
				}).catch(err => this.view.showWarningMessage(err));
		}
	}

}
