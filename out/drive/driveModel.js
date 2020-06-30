"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveModel = void 0;
const driveTypeConverter_1 = require("./driveTypeConverter");
const driveAuthenticator_1 = require("../auth/driveAuthenticator");
const { google } = require('googleapis');
class DriveModel {
    constructor() {
        this.authenticator = new driveAuthenticator_1.DriveAuthenticator();
        this.allFiles = new Map();
    }
    listFiles(parentFolderId) {
        return new Promise((resolve, reject) => {
            this.authenticator.authenticate()
                .then((auth) => resolve(this._listFiles(parentFolderId, auth)))
                .catch(err => reject(err));
        });
    }
    _listFiles(parentFolderId, auth) {
        return new Promise((resolve, reject) => {
            const drive = google.drive({ version: 'v3', auth });
            const listParams = {
                pageSize: 20,
                q: `'${parentFolderId}' in parents and trashed = false`,
                orderBy: 'folder,name',
                fields: 'nextPageToken, files(id, name, iconLink, mimeType)'
                // fields: '*'
            };
            const callback = (err, res) => {
                if (err)
                    return reject(err);
                const apiFiles = res.data.files;
                const convertedFiles = driveTypeConverter_1.DriveTypeConverter.fromApiToTypescript(apiFiles);
                this.updateCurrentInfo(convertedFiles);
                resolve(convertedFiles);
            };
            drive.files.list(listParams, callback);
        });
    }
    updateCurrentInfo(files) {
        // this.allFiles.clear();
        files.forEach((file) => this.allFiles.set(file.id, file));
    }
    getAllDriveFileIds() {
        const idArray = [];
        this.allFiles.forEach((_file, id) => idArray.push(id));
        return idArray;
    }
    getAllDriveFiles() {
        const filesArray = [];
        this.allFiles.forEach((file, _id) => filesArray.push(file));
        return filesArray;
    }
    getDriveFile(id) {
        return this.allFiles.get(id);
    }
}
exports.DriveModel = DriveModel;
//# sourceMappingURL=driveModel.js.map