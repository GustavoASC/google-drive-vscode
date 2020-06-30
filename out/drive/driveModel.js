"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveModel = void 0;
const googleDriveFileProvider_1 = require("./googleDriveFileProvider");
class DriveModel {
    constructor() {
        this.fileProvider = new googleDriveFileProvider_1.GoogleDriveFileProvider();
        this.allFiles = new Map();
    }
    listFiles(parentFolderId) {
        return new Promise((resolve, reject) => {
            this.fileProvider.provideFiles(parentFolderId)
                .then(files => {
                this.updateCurrentInfo(files);
                resolve(files);
            })
                .catch(err => reject(err));
        });
    }
    updateCurrentInfo(files) {
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