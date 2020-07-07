import { DriveFile, FileType } from "./driveTypes";
import * as path from "path";
import * as fs from "fs";

export class DriveModel {

    private cachedFiles: Map<string, DriveFile> = new Map();

    constructor(private fileProvider: IFileProvider) {
    }

    listOnlyFolders(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve, reject) => {
            this.listFiles(parentFolderId)
                .then(allFilesFromParent => {
                    const onlyFolders = allFilesFromParent.filter(f => f.type == FileType.DIRECTORY);
                    resolve(onlyFolders);
                }).catch(err => reject(err));
        });
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

    downloadFile(fileId: string, destionationPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const createStreamFunction = () => {
                return fs.createWriteStream(destionationPath);
            }
            this.fileProvider.retrieveFileContent(fileId, createStreamFunction)
                .then(() => resolve())
                .catch(err => reject(err));
        })
    }

    private updateCurrentInfo(files: DriveFile[]) {
        files.forEach((file) => this.cachedFiles.set(file.id, file));
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
    retrieveFileContent(fileId: string, createStreamFunction: () => NodeJS.WritableStream): Promise<void>;

}
