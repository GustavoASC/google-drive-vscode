import { DriveView } from "./driveView";
import { DriveModel } from "./driveModel";

export class DriveController {

	private view: DriveView = new DriveView(this.model);

	constructor(private model: DriveModel) { }

	listFiles(parentFolderId: string): void {
		this.model.listFiles(parentFolderId)
			.then(_files => this.view.refresh())
			.catch(err => this.view.showWarningMessage(err));
	}

	async createFolder(parentFolderId: string): Promise<void> {
		const folderName = await this.view.showInputBox('Please type the folder name');
		if (folderName) {
			const createFolderPromise: Promise<void> = new Promise((resolve, reject) => {
				this.model.createFolder(parentFolderId, folderName)
					.then(_files => {
						this.view.showInformationMessage(`Folder '${folderName}' successfully created on Drive.`);
						this.view.refresh();
						resolve();
					})
					.catch(err => {
						this.view.showWarningMessage(err);
						reject(err);
					})
			});
			this.view.showProgressMessage(`Creating folder '${folderName}' to Google Drive. Please wait...`, createFolderPromise);
		} else {
			this.view.showWarningMessage(`'Create folder' process canceled by user.`);
		}
	}

	async uploadFile(fullFileName: string): Promise<void> {
		const parentID = await this.view.askForRemoteDestinationFolder();
		if (parentID) {
			const uploadPromise: Promise<void> = new Promise((resolve, reject) => {
				this.model.uploadFile(parentID, fullFileName)
					.then((basename) => {
						this.view.showInformationMessage(`File '${basename}' successfully uploaded to Drive.`);
						this.view.refresh();
						resolve();
					}).catch(err => {
						this.view.showWarningMessage(err);
						reject(err);
					});
			});
			this.view.showProgressMessage('Uploading file to Google Drive. Please wait...', uploadPromise);
		} else {
			this.view.showWarningMessage(`'Upload file' process canceled by user.`);
		}
	}

	downloadFile(fileId: string): void {
		const driveFileName = this.model.getDriveFile(fileId)?.name;
		this.view.askForLocalDestinationFolder(driveFileName)
			.then(destinationFile => {
				const downloadPromise: Promise<void> = new Promise((resolve, reject) => {
					this.model.downloadFile(fileId, destinationFile)
						.then(() => {
							this.view.showInformationMessage(`File successfully downloaded from Drive.`);
							resolve();
						}).catch(err => {
							this.view.showWarningMessage(err);
							reject(err);
						});
				});
				this.view.showProgressMessage('Downloading file from Google Drive. Please wait...', downloadPromise);
			}).catch(() => this.view.showWarningMessage(`'Download file' process canceled by user.`));
	}

}
