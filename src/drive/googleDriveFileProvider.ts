import { DriveFile } from "./driveTypes";
import { DriveTypeConverter } from "./driveTypeConverter";
import { DriveAuthenticator } from '../auth/driveAuthenticator';
import * as mime from "mime-types";
import * as fs from "fs";
import * as path from "path";
const { google } = require('googleapis');
import { IFileProvider } from "./driveModel";

const HTTP_RESPONSE_OK = 200;

export class GoogleDriveFileProvider implements IFileProvider {

    private authenticator = new DriveAuthenticator();

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
                        err ? reject(err) : resolve();
                    });
                    drive.files.create({
                        resource: fileMetadata,
                        media: media,
                        fields: 'id'
                    }, callback);
                }).catch(err => reject(err));
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
                    drive.files.create({ resource: fileMetadata })
                        .then((response: any) => response.status == HTTP_RESPONSE_OK ? resolve() : reject())
                        .catch(() => reject());
                }).catch(err => reject(err));
        });
    }

    retrieveFileContent(fileId: string, createStreamFunction: () => NodeJS.WritableStream): Promise<void> {
        return new Promise((resolve, reject) => {
            this.authenticator.authenticate()
                .then((auth) => {
                    const drive = google.drive({ version: 'v3', auth });
                    drive.files.get({
                        'fileId': fileId,
                        'alt': 'media'
                    }, {
                        responseType: 'stream'
                    }, function (err: any, response: any) {
                        if (err) return reject(err);
                        response.data.on('error', (err: any) => {
                            reject(err);
                        }).on('end', () => {
                            resolve();
                        }).pipe(createStreamFunction());
                    });
                }).catch(err => reject(err));;
        });
    }

}
