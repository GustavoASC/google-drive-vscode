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
			const uploadPromise: Promise<void> = new Promise((resolve, reject) => {
				this.model.uploadFile(parentID, fullFileName)
					.then((basename) => {
						this.view.showInformationMessage(`File '${basename}' successfully uploaded.`);
						this.view.refresh();
						resolve();
					}).catch(err => {
						this.view.showWarningMessage(err);
						reject(err);
					});
			})
			this.view.showProgressMessage('Uploading file to Google Drive. Please wait...', uploadPromise);
		}
	}

}
