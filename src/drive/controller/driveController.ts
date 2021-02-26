import { IDriveView } from "../view/driveView";
import { DriveModel } from "../model/driveModel";
import { DownloadSupport } from "./downloadSupport";
import { RenameSupport } from "./renameSupport";
import { UploadSupport } from "./uploadSupport";
import { FolderSupport } from "./folderSupport";
import { OpenRemoteFileSupport } from "./openRemoteFileSupport";
import { IControllerSupport } from "./controllerSupport";
import { DRIVE_SCHEME } from "../fileSystem/fileSystemConstants";
import { UploadFolderSupport } from "./uploadFolderSupport";
import { CopyToClipboardSupport } from "./CopyToClipboardSupport";
import { IClipboardProvider } from "./clipboardProvider";

export class DriveController {

	// Support controllers
	private downloadSupport = new DownloadSupport();
	private renameSupport = new RenameSupport();
	private folderSupport = new FolderSupport();
	private openSupport = new OpenRemoteFileSupport();

	constructor(private model: DriveModel, private view: IDriveView) { }

	listFiles(parentFolderId: string): void {
		this.model.listFiles(parentFolderId)
			.then(_files => this.view.refresh())
			.catch(err => this.view.showWarningMessage(err));
	}

	createFolder(parentFolderId?: string): void {
		const finalId = parentFolderId ? parentFolderId : 'root';
		this.fireCommand(this.folderSupport, finalId);
	}

	uploadFileAndAskFolder(scheme: string, fullFileName: string): void {
		if (scheme === DRIVE_SCHEME) {
			this.view.showWarningMessage(`It's not possible to proceed with upload operation since file is already on Google Drive.`);
		} else {
			this.view.askForRemoteDestinationFolder()
				.then(parentId => {
					if (parentId) {
						this.uploadFileToFolder(fullFileName, parentId);
					} else {
						this.view.showWarningMessage(`'Upload file' process canceled by user.`);
					}
				}).catch(err => this.view.showWarningMessage(err));
		}
	}

	uploadFileToFolder(fullFileName: string, folderId: string): void {
		const uploadSupport = new UploadSupport(fullFileName);
		this.fireCommand(uploadSupport, folderId);
	}

	uploadFolder(folderPath: string): void {
		this.view.askForRemoteDestinationFolder()
			.then(parentId => {
				if (parentId) {
					const uploadSupport = new UploadFolderSupport(folderPath);
					this.fireCommand(uploadSupport, parentId);
				} else {
					this.view.showWarningMessage(`'Upload folder' process canceled by user.`);
				}
			}).catch(err => this.view.showWarningMessage(err));
	}

	downloadFile(fileId: string): void {
		this.fireCommand(this.downloadSupport, fileId);
	}

	renameFile(fileId: string): void {
		this.fireCommand(this.renameSupport, fileId);
	}

	copyUrlToClipboard(clipboardProvider: IClipboardProvider, fileId: string): void {
		const copyToClipboardSupport = new CopyToClipboardSupport(clipboardProvider);
		this.fireCommand(copyToClipboardSupport, fileId);
	}

	openRemoteFile(fileId: string): void {
		this.fireCommand(this.openSupport, fileId);
	}

	fireCommand(support: IControllerSupport, fileId: string): void {
		support.fireCommand(this.model, this.view, fileId);
	}

}

