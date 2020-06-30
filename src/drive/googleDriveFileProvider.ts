import { DriveFile } from "./driveTypes";
import { DriveTypeConverter } from "./driveTypeConverter";
import { DriveAuthenticator } from '../auth/driveAuthenticator';
const { google } = require('googleapis');
import { IFileProvider } from "./driveModel";

export class GoogleDriveFileProvider implements IFileProvider {

    private authenticator = new DriveAuthenticator();

    provideFiles(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve, reject) => {
            this.authenticator.authenticate()
                .then((auth) => resolve(this._provideFiles(parentFolderId, auth)))
                .catch(err => reject(err));
        });
    }

    private _provideFiles(parentFolderId: string, auth: any): Promise<DriveFile[]> {
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
                if (err)
                    return reject(err);
                const apiFiles = res.data.files;
                const convertedFiles = DriveTypeConverter.fromApiToTypescript(apiFiles);
                resolve(convertedFiles);
            };
            drive.files.list(listParams, callback);
        });
    }
}
