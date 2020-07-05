import { DriveFile } from "./driveTypes";
import { DriveTypeConverter } from "./driveTypeConverter";
import { DriveAuthenticator } from '../auth/driveAuthenticator';
import * as mime from "mime-types";
import * as fs from "fs";
import * as path from "path";
const { google } = require('googleapis');
import { IFileProvider } from "./driveModel";

export class GoogleDriveFileProvider implements IFileProvider {

    private authenticator = new DriveAuthenticator();

    isConnectedToRemoteDrive(): boolean {
        return this.authenticator.isAuthenticated();
    }

    provideFiles(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve, reject) => {
            this.authenticator.authenticate()
                .then((auth) => {
                    const drive = google.drive({ version: 'v3', auth });
                    const listParams = {
                        q: `'${parentFolderId}' in parents and trashed = false`,
                        orderBy: 'folder,name',
                        fields: 'nextPageToken, files(id, name, iconLink, mimeType)'
                    };
                    const callback = (err: any, res: any) => {
                        if (err) {
                            return reject(err);
                        }
                        const apiFiles = res.data.files;
                        const convertedFiles = DriveTypeConverter.fromApiToTypescript(apiFiles);
                        resolve(convertedFiles);
                    };
                    drive.files.list(listParams, callback);
                })
                .catch(err => reject(err));
        });
    }

    uploadFile(parentFolderId: string, fullFileName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.authenticator.authenticate()
                .then((auth) => {
                    const drive = google.drive({ version: 'v3', auth });
                    const basename = path.basename(fullFileName);
                    const mimeType = mime.lookup(fullFileName) || 'text/plain';
                    const fileMetadata = {
                        'name': basename,
                        'parents': [parentFolderId]
                    };
                    const media = {
                        mimeType: mimeType,
                        body: fs.createReadStream(fullFileName)
                    };
                    const callback = ((err: any, _file: any) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve();
                        }
                    });
                    drive.files.create({
                        resource: fileMetadata,
                        media: media,
                        fields: 'id'
                    }, callback);
                })
                .catch(err => reject(err));
        });
    }

    createFolder(parentFolderId: string, folderName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.authenticator.authenticate()
                .then((auth) => {
                    const drive = google.drive({ version: 'v3', auth });
                    const fileMetadata = {
                        'name': folderName,
                        'mimeType': 'application/vnd.google-apps.folder',
                        'parents': [parentFolderId]
                    };
                    drive.files.create({
                        resource: fileMetadata,
                    }).then((response: any) => {
                        switch (response.status) {
                            case 200:
                                const file = response.result;
                                return resolve();
                            default:
                                return reject();
                        }
                    }).catch(() => reject());
                }).catch(err => reject(err));
        });
    }

}
