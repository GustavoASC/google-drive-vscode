import { FileSystemProvider, Event, Uri, Disposable, FileStat, FileType, FileChangeEvent, EventEmitter } from "vscode";
import { DriveModel } from "../model/driveModel";

export class DriveFileSystemProvider implements FileSystemProvider {

    constructor(private model: DriveModel) { }

    private _emitter = new EventEmitter<FileChangeEvent[]>();
    readonly onDidChangeFile: Event<FileChangeEvent[]> = this._emitter.event;

    watch(uri: Uri, options: { recursive: boolean; excludes: string[]; }): Disposable {
        return new Disposable(() => { });
    }

    stat(uri: Uri): FileStat | Thenable<FileStat> {
        return {
            type: FileType.File,
            ctime: 100000000,
            mtime: 100000000,
            size: 444444,
        };
    }

    readDirectory(uri: Uri): [string, FileType][] | Thenable<[string, FileType][]> {
        throw new Error("Method not implemented.");
    }

    createDirectory(uri: Uri): void | Thenable<void> {
        throw new Error("Method not implemented.");
    }

    readFile(uri: Uri): Uint8Array | Thenable<Uint8Array> {
        return new Promise((resolve, reject) => {
            const fileId = uri.fragment;
            this.model.retrieveFileContentStream(fileId)
                .then(contentStream => {


                    const byteArray: Buffer[] = [];
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
