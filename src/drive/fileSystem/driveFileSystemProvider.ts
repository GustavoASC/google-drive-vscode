import { FileSystemProvider, Event, Uri, Disposable, FileStat, FileType as vsFileType, FileChangeEvent, EventEmitter } from "vscode";
import { DriveModel } from "../model/driveModel";
import { FileType, DriveFile } from "../model/driveTypes";

export class DriveFileSystemProvider implements FileSystemProvider {

    constructor(private model: DriveModel) { }

    private _emitter = new EventEmitter<FileChangeEvent[]>();
    readonly onDidChangeFile: Event<FileChangeEvent[]> = this._emitter.event;

    watch(uri: Uri, options: { recursive: boolean; excludes: string[]; }): Disposable {
        return new Disposable(() => { });
    }

    stat(uri: Uri): FileStat | Thenable<FileStat> {
        return new Promise((resolve, reject) => {
            const fileId = uri.fragment;
            const driveFile = this.model.getDriveFile(fileId);
            if (driveFile) {
                const fileStat = this.buildFileStat(driveFile);
                resolve(fileStat);
            } else {
                reject('File not found');
            }
        });
    }

    private buildFileStat(driveFile: DriveFile): FileStat {
        const vscodeType = this.detectFileType(driveFile);
        const fileStat = {
            type: vscodeType,
            ctime: driveFile.createdTime,
            mtime: driveFile.modifiedTime,
            size: driveFile.size,
        };
        return fileStat;
    }

    private detectFileType(driveFile: DriveFile): vsFileType {
        const driveType = driveFile.type;
        const vsType = driveType == FileType.DIRECTORY ? vsFileType.Directory : vsFileType.File;
        return vsType
    }

    readDirectory(uri: Uri): [string, vsFileType][] | Thenable<[string, vsFileType][]> {
        throw new Error("Method not implemented.");
    }

    createDirectory(uri: Uri): void | Thenable<void> {
        throw new Error("Method not implemented.");
    }

    readFile(uri: Uri): Thenable<Uint8Array> {
        return new Promise((resolve, reject) => {
            const fileId = uri.fragment;
            this.model.retrieveFileContentStream(fileId)
                .then(contentStream => {


                    const byteArray: any[] = [];
                    contentStream.on('data', d => byteArray.push(d));
                    contentStream.on('end', () => {
                        const result = Buffer.concat(byteArray);
                        resolve(result);
                    });


                }).catch(err => reject(err));
        });
    }

    writeFile(uri: Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): void | Thenable<void> {
        throw new Error("Method not implemented.");
    }

    delete(uri: Uri, options: { recursive: boolean; }): void | Thenable<void> {
        throw new Error("Method not implemented.");
    }

    rename(oldUri: Uri, newUri: Uri, options: { overwrite: boolean; }): void | Thenable<void> {
        throw new Error("Method not implemented.");
    }

}
