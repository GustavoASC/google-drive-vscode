import { DriveFile, FileType } from "./driveTypes";
import * as path from "path";
import { GoogleDriveFileProvider } from "./googleDriveFileProvider";

export class DriveModel {

    private fileProvider: IFileProvider = new GoogleDriveFileProvider();
    private cachedFiles: Map<string, DriveFile> = new Map();

    listOnlyFolders(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve, reject) => {
            this.listFiles(parentFolderId)
                .then(allFilesFromParent => {
                    const onlyFolders = allFilesFromParent.filter(f => f.type == FileType.DIRECTORY);
                    resolve(onlyFolders);
                }).catch(err => reject(err));
        })
    }

    listFiles(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve, reject) => {
            this.fileProvider.provideFiles(parentFolderId)
                .then(files => {
                    this.updateCurrentInfo(files);
                    resolve(files);
                })
                .catch(err => reject(err));
        });
    }

    createFolder(parentFolderId: string, folderName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.fileProvider.createFolder(parentFolderId, folderName)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    uploadFile(parentFolderId: string, fullFileName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.fileProvider.uploadFile(parentFolderId, fullFileName)
                .then(() => {
                    const basename = path.basename(fullFileName);
                    resolve(basename);
                })
                .catch((err) => reject(err));
        });
    }

    private updateCurrentInfo(files: DriveFile[]) {
        files.forEach((file) => this.cachedFiles.set(file.id, file));
    }

    getAllDriveFileIds(): string[] {
        const idArray: string[] = [];
        this.cachedFiles.forEach((_file, id) => idArray.push(id));
        return idArray;
    }

    getAllDriveFiles(): DriveFile[] {
        const filesArray: DriveFile[] = [];
        this.cachedFiles.forEach((file, _id) => filesArray.push(file));
        return filesArray;
    }

    getDriveFile(id: string): DriveFile | undefined {
        return this.cachedFiles.get(id);
    }
}

export interface IFileProvider {

    provideFiles(parentFolderId: string): Promise<DriveFile[]>;
    createFolder(parentFolderId: string, folderName: string): Promise<void>;
    uploadFile(parentFolderId: string, fullFilePath: string): Promise<void>;

}
