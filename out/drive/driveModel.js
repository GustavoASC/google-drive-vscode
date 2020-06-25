"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveModel = void 0;
class DriveModel {
    constructor() {
        this.allFiles = new Map();
        this.allFiles.set(1, { type: FileType.FILE, name: "Meu arquivo" });
        this.allFiles.set(2, { type: FileType.FILE, name: "Outro arquivo" });
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
var FileType;
(function (FileType) {
    FileType[FileType["FILE"] = 0] = "FILE";
    FileType[FileType["DIRECTORY"] = 1] = "DIRECTORY";
})(FileType || (FileType = {}));
//# sourceMappingURL=driveModel.js.map