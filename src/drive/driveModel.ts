import { DriveFile } from "./driveTypes";
import { resolve } from "dns";
import { GoogleDriveFileProvider } from "./googleDriveFileProvider";

export class DriveModel {

    private fileProvider: IFileProvider = new GoogleDriveFileProvider();
    private allFiles: Map<string, DriveFile> = new Map();

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

    private updateCurrentInfo(files: DriveFile[]) {
        files.forEach((file) => this.allFiles.set(file.id, file));
    }

    getAllDriveFileIds(): string[] {
        const idArray: string[] = [];
        this.allFiles.forEach((_file, id) => idArray.push(id));
        return idArray;
    }

    getAllDriveFiles(): DriveFile[] {
        const filesArray: DriveFile[] = [];
        this.allFiles.forEach((file, _id) => filesArray.push(file));
        return filesArray;
    }

    getDriveFile(id: string): DriveFile | undefined {
        return this.allFiles.get(id);
    }
}

export interface IFileProvider {

    provideFiles(parentFolderId: string): Promise<DriveFile[]>;

}
