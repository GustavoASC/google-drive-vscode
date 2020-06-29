import { DriveFile, FileType } from "./driveTypes";

const { google } = require('googleapis');

export class DriveModel {

    private allFiles: Map<string, DriveFile> = new Map();
    private typeConverter: DriveTypeConverter = new DriveTypeConverter();

    listFiles(auth: any): Promise<DriveFile[]> {
        return new Promise((resolve, reject) => {
            const drive = google.drive({ version: 'v3', auth });
            const listParams = {
                pageSize: 20,
                q: "'root' in parents and trashed = false",
                orderBy: 'folder,name',
                fields: 'nextPageToken, files(id, name, iconLink)'
                // fields: '*'
            };
            const callback = (err: any, res: any) => {
                if (err) return reject(err);
                const apiFiles = res.data.files;
                const convertedFiles = this.typeConverter.convertApiToTypescript(apiFiles);
                this.updateCurrentInfo(convertedFiles);
                resolve(convertedFiles);
            };
            drive.files.list(listParams, callback);
        });
    }

    private updateCurrentInfo(files: DriveFile[]) {
        this.allFiles.clear();
        files.forEach((file) => this.allFiles.set(file.id, file));
    }

    getAllDriveFileIds(): string[] {
        const idArray: string[] = [];
        this.allFiles.forEach((_file, id) => {
            idArray.push(id);
        });
        return idArray;
    }

    getAllDriveFiles(): DriveFile[] {
        const filesArray: DriveFile[] = [];
        this.allFiles.forEach((file, _id) => {
            filesArray.push(file);
        });
        return filesArray;
    }

    getDriveFile(id: string): DriveFile | undefined {
        return this.allFiles.get(id);
    }
}

class DriveTypeConverter {

    convertApiToTypescript(apiFiles: any): DriveFile[] {
        const finalFiles: DriveFile[] = [];
        apiFiles.map((file: any) => {
            finalFiles.push({
                id: file.id,
                name: file.name,
                iconLink: file.iconLink,
                type: FileType.FILE
            });
        });
        return finalFiles;
    }

}
