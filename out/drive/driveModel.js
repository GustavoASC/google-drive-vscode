"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveModel = void 0;
const driveTypes_1 = require("./driveTypes");
const { google } = require('googleapis');
class DriveModel {
    constructor() {
        this.allFiles = new Map();
        this.typeConverter = new DriveTypeConverter();
    }
    listFiles(auth) {
        return new Promise((resolve, reject) => {
            const drive = google.drive({ version: 'v3', auth });
            const listParams = {
                pageSize: 20,
                q: "'root' in parents and trashed = false",
                orderBy: 'folder,name',
                fields: 'nextPageToken, files(id, name, iconLink)'
                // fields: '*'
            };
            const callback = (err, res) => {
                if (err)
                    return reject(err);
                const apiFiles = res.data.files;
                const convertedFiles = this.typeConverter.convertApiToTypescript(apiFiles);
                this.updateCurrentInfo(convertedFiles);
                resolve(convertedFiles);
            };
            drive.files.list(listParams, callback);
        });
    }
    updateCurrentInfo(files) {
        this.allFiles.clear();
        files.forEach((file) => this.allFiles.set(file.id, file));
    }
    getAllDriveFileIds() {
        const idArray = [];
        this.allFiles.forEach((_file, id) => {
            idArray.push(id);
        });
        return idArray;
    }
    getAllDriveFiles() {
        const filesArray = [];
        this.allFiles.forEach((file, _id) => {
            filesArray.push(file);
        });
        return filesArray;
    }
    getDriveFile(id) {
        return this.allFiles.get(id);
    }
}
exports.DriveModel = DriveModel;
class DriveTypeConverter {
    convertApiToTypescript(apiFiles) {
        const finalFiles = [];
        apiFiles.map((file) => {
            finalFiles.push({
                id: file.id,
                name: file.name,
                iconLink: file.iconLink,
                type: driveTypes_1.FileType.FILE
            });
        });
        return finalFiles;
    }
}
//# sourceMappingURL=driveModel.js.map