import { DriveView } from "../view/driveView";
import { DriveModel } from "../model/driveModel";
import { DownloadControllerSupport } from "./downloadControllerSupport";
import { RenameControllerSupport } from "./renameControllerSupport";
import { UploadControllerSupport } from "./uploadControllerSupport";
import { FolderControllerSupport } from "./folderControllerSupport";

export class DriveController {

	private view: DriveView = new DriveView(this.model);

	// Support controllers
	private downloadSupport = new DownloadControllerSupport(this.model, this.view);
	private uploadSupport = new UploadControllerSupport(this.model, this.view);
	private renameSupport = new RenameControllerSupport(this.model, this.view);
	private folderSupport = new FolderControllerSupport(this.model, this.view);

	constructor(private model: DriveModel) { }

	listFiles(parentFolderId: string): void {
		this.model.listFiles(parentFolderId)
			.then(_files => this.view.refresh())
			.catch(err => this.view.showWarningMessage(err));
	}

	createFolder(parentFolderId?: string): void {
		const finalId = parentFolderId ? parentFolderId : 'root';
		this.folderSupport.createFolder(finalId);
	}

	async uploadFileAndAskFolder(fullFileName: string): Promise<void> {
		const parentID = await this.view.askForRemoteDestinationFolder();
		if (parentID) {
			this.uploadSupport.uploadFileToFolder(fullFileName, parentID);
		} else {
			this.view.showWarningMessage(`'Upload file' process canceled by user.`);
		}
	}

	uploadFileToFolder(fullFileName: string, folderId: string): void {
		this.uploadSupport.uploadFileToFolder(fullFileName, folderId);
	}

	downloadFile(fileId: string): void {
		this.downloadSupport.downloadFile(fileId);
	}

	renameFile(fileId: string): void {
		this.renameSupport.renameFile(fileId);
	}

}

