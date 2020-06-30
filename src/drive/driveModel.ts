import { DriveFile } from "./driveTypes";
import { DriveTypeConverter } from "./driveTypeConverter";
import { DriveAuthenticator } from '../auth/driveAuthenticator';

const { google } = require('googleapis');

export class DriveModel {

	private authenticator = new DriveAuthenticator();
    private allFiles: Map<string, DriveFile> = new Map();

    listFiles(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve, reject) => {
            this.authenticator.authenticate()
                .then((auth) => resolve(this._listFiles(parentFolderId, auth)))
                .catch(err => reject(err));
        });
    }

    private _listFiles(parentFolderId: string, auth: any): Promise<DriveFile[]> {
        return new Promise((resolve, reject) => {
            const drive = google.drive({ version: 'v3', auth });
            const listParams = {
                pageSize: 20,
                q: `'${parentFolderId}' in parents and trashed = false`,
                orderBy: 'folder,name',
                fields: 'nextPageToken, files(id, name, iconLink, mimeType)'
                // fields: '*'
            };
            const callback = (err: any, res: any) => {
                if (err) return reject(err);
                const apiFiles = res.data.files;
                const convertedFiles = DriveTypeConverter.fromApiToTypescript(apiFiles);
                this.updateCurrentInfo(convertedFiles);
                resolve(convertedFiles);
            };
            drive.files.list(listParams, callback);
        });
    }

    private updateCurrentInfo(files: DriveFile[]) {
        // this.allFiles.clear();
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
