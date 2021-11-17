import { DriveFile } from "./driveTypes";
import { DriveTypeConverter } from "./driveTypeConverter";
import { DriveAuthenticator } from '../../auth/driveAuthenticator';
import * as fs from "fs";
const { google } = require('googleapis');
import { IFileProvider } from "./driveModel";
import { Readable } from "stream";

const HTTP_RESPONSE_OK = 200;

export class GoogleDriveFileProvider implements IFileProvider {

    private typeConverter = new DriveTypeConverter();

    constructor(private authenticator: DriveAuthenticator) { }

    provideFiles(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve, reject) => {
            this.authenticator.authenticate().then((auth) => {
                const listParams = {
                    q: `'${parentFolderId}' in parents and trashed = false`,
                    orderBy: 'folder,name',
                    pageSize: 1000,
                    fields: 'nextPageToken, files(id, name, iconLink, mimeType, size, modifiedTime, createdTime)'
                };
                const callbackFn = (err: any, res: any) => {
                    if (err) {
                        return reject(err);
                    }
                    const apiFiles = res.data.files;
                    const convertedFiles = this.typeConverter.fromApiToTypescript(apiFiles);
                    resolve(convertedFiles);
                };
                drive(auth).files.list(listParams, callbackFn);
            }).catch(err => reject(err));
        });
    }

    uploadFile(parentFolderId: string, fullFileName: string, basename: string, mimeType: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.authenticator.authenticate().then((auth) => {
                const callbackFn = ((err: any, _file: any) => {
                    err ? reject(err) : resolve();
                });
                const media = {
                    mimeType: mimeType,
                    body: fs.createReadStream(fullFileName).on('error', err => reject(err.message))
                };
                this.getFileId(parentFolderId, basename).then((originalFileId) => {
                    if (originalFileId === '') {
                        drive(auth).files.create({
                            resource: {
                                'name': basename,
                                'parents': [parentFolderId]
                            },
                            media: media,
                            fields: 'id'
                        }, callbackFn);
                    } else {
                        drive(auth).files.update({
                            fileId: originalFileId,
                            media: media,
                        }, callbackFn);
                    }
                }).catch((err) => {
                    reject(err);
                })
            }).catch(err => reject(err));
        });
    }

    createFolder(parentFolderId: string, folderName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.authenticator.authenticate().then((auth) => {
                const fileMetadata = {
                    'name': folderName,
                    'mimeType': 'application/vnd.google-apps.folder',
                    'parents': [parentFolderId]
                };
                drive(auth).files.create({ resource: fileMetadata })
                    .then((response: any) => response.status == HTTP_RESPONSE_OK ? resolve() : reject())
                    .catch(() => reject());
            }).catch(err => reject(err));
        });
    }

    retrieveFileContentStream(fileId: string): Promise<Readable> {
        return new Promise((resolve, reject) => {
            this.authenticator.authenticate().then((auth) => {
                const getParams = {
                    'fileId': fileId,
                    'alt': 'media'
                };
                const responseType = { responseType: 'stream' };
                const callbackFn = (err: any, response: any) => {
                    err ? reject(err) : resolve(response.data);
                };
                drive(auth).files.get(getParams, responseType, callbackFn);
            }).catch(err => reject(err));
        });
    }

    renameFile(fileId: string, newName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.authenticator.authenticate().then((auth) => {
                const resource = {
                    name: newName
                }
                const updateParams = {
                    fileId: fileId,
                    resource: resource
                };
                const callbackFn = (err: any, _response: any) => {
                    err ? reject(err) : resolve();
                };
                drive(auth).files.update(updateParams, callbackFn);
            }).catch(err => reject(err));
        });
    }

    getFileId(parentId: string, fileName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.authenticator.authenticate().then((auth) => {
                const listParams = {
                    q: `name = '${fileName}' and parents = '${parentId}' and trashed = false`,
                    fields: 'nextPageToken, files(id)',
                    orderBy: 'folder,name',
                    pageSize: 10,
                };
                const callbackFn = (err: any, res: any) => {
                    if (err) {
                        return reject(err);
                    }
                    if (res.data.files.length == 0) {
                        return resolve('');
                    }
                    resolve(res.data.files[0].id);
                };
                drive(auth).files.list(listParams, callbackFn);
            }).catch(err => reject(err));

        })
    }
}

function drive(auth: any): any {
    const drive = google.drive({ version: 'v3', auth });
    return drive;
}
