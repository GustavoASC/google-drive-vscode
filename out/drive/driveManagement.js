"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveController = void 0;
const driveView_1 = require("./driveView");
const driveModel_1 = require("./driveModel");
class DriveController {
    constructor() {
        this.model = new driveModel_1.DriveModel();
        this.view = new driveView_1.DriveView(this);
    }
    fetchFiles() {
        // const _files = this.model.getAllDriveFiles()
        this.view.refresh();
        // .catch(() => this.view.showUnexpectedErrorMessage('Load files'));
    }
    getAllDriveFileIds() {
        return this.model.getAllDriveFileIds();
    }
    getAllDriveFiles() {
        return this.model.getAllDriveFiles();
    }
    getDriveFile(id) {
        return this.model.getDriveFile(id);
    }
}
exports.DriveController = DriveController;
//# sourceMappingURL=driveManagement.js.map