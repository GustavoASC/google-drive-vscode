import { DriveFile, FileType } from "./driveTypes";
import * as mime from "mime-types";
import * as path from "path";
import * as fs from "fs";
import { Readable } from "stream";
import { FolderZipper } from "./folderZipper";

export class DriveModel {

    private cachedFiles: Map<string, DriveFile> = new Map();

    constructor(private fileProvider: IFileProvider) {
    }

    listOnlyFolders(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve, reject) => {
            this.listFiles(parentFolderId).then(allFilesFromParent => {
                const onlyFolders = allFilesFromParent.filter(f => f.type == FileType.DIRECTORY);
                resolve(onlyFolders);
            }).catch(err => reject(err));
        });
    }

    listFiles(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve, reject) => {
            this.fileProvider.provideFiles(parentFolderId).then(files => {
                this.defineParentForFiles(parentFolderId, files)
                this.updateCurrentInfo(files);
                resolve(files);
            }).catch(err => reject(err));
        });
    }

    private defineParentForFiles(parentFolderId: string, files: DriveFile[]): void {
        const parentFolder = this.getDriveFile(parentFolderId);
        if (parentFolder) {
            files.forEach(f => f.parent = parentFolder);
        }
    }

    private updateCurrentInfo(files: DriveFile[]) {
        files.forEach((file) => this.cachedFiles.set(file.id, file));
    }

    createFolder(parentFolderId: string, folderName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.fileProvider.createFolder(parentFolderId, folderName)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    uploadFolder(parentFolderId: string, folderPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const basename = path.basename(folderPath);

            if (!fs.existsSync(folderPath)) {
                return reject(`Folder '${basename}' does not exist. Impossible to proceed with upload operation.`);
            }

            new FolderZipper().zipToTemp(folderPath)
                .then(zipFullName => {
                    // Uploads the temp zip file and deletes it at the end
                    this.uploadFile(parentFolderId, zipFullName)
                        .then(() => {
                            fs.unlinkSync(zipFullName);
                            resolve(basename);
                        }).catch(err => {
                            fs.unlinkSync(zipFullName);
                            reject(err)
                        });
                }).catch(err => reject(err));
        });
    }

    uploadFile(parentFolderId: string, fullFileName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const basename = path.basename(fullFileName);
            const mimeType = mime.lookup(fullFileName) || 'text/plain';

            if (!fs.existsSync(fullFileName)) {
                return reject(`File '${basename}' does not exist. Impossible to proceed with upload operation.`);
            }

            if (fs.statSync(fullFileName).isDirectory()) {
                return reject(`'${basename}' is a directory. This extension currently does not support uploading directories to Google Drive.`);
            }

            this.fileProvider.uploadFile(parentFolderId, fullFileName, basename, mimeType)
                .then(() => resolve(basename))
                .catch(err => reject(err));
        });
    }

    retrieveFileContentStream(fileId: string): Promise<Readable> {
        return new Promise((resolve, reject) => {
            this.fileProvider.retrieveFileContentStream(fileId)
                .then(contentStream => resolve(contentStream))
                .catch(err => reject(err));
        })
    }

    downloadFile(fileId: string, destionationPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.fileProvider.retrieveFileContentStream(fileId)
                .then(contentStream => {

                    // Prepares the stream to write data on disk
                    const writeStream = fs.createWriteStream(destionationPath)
                        .on('error', (err) => {

                            const message = err?.message;
                            const finalMessage = message ? message : 'Unknown error';

                            reject(finalMessage);

                        })
                        .on('close', () => resolve());

                    // Flushes the input data to disk
                    contentStream.pipe(writeStream);

                })
                .catch(err => reject(err));
        })
    }

    renameFile(fileId: string, newName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.fileProvider.renameFile(fileId, newName)
                .then(() => {
                    const driveFile = this.getDriveFile(fileId);
                    if (driveFile) {
                        driveFile.name = newName;
                    }
                    resolve();
                }).catch(err => reject(err));
        });
    }

    getDriveFile(id: string): DriveFile | undefined {
        return this.cachedFiles.get(id);
    }

    getDriveFileFromName(name: string): DriveFile | undefined {
        let driveFile: DriveFile | undefined;
        this.cachedFiles.forEach((value: DriveFile, key: string) => {
            if (!driveFile && value.name === name) {
                driveFile = value;
            }
        });
        return driveFile;
    }

}

export interface IFileProvider {

    provideFiles(parentFolderId: string): Promise<DriveFile[]>;
    createFolder(parentFolderId: string, folderName: string): Promise<void>;
    uploadFile(parentFolderId: string, fullFilePath: string, basename: string, mimeType: string): Promise<void>;
    retrieveFileContentStream(fileId: string): Promise<Readable>;
    renameFile(fileId: string, newName: string): Promise<void>;

}
