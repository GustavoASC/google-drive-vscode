"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveView = void 0;
const vscode_1 = require("vscode");
class DriveView {
    constructor(controller) {
        this.controller = controller;
        /** Helper objects to refresh UI when a new monitor is added */
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        vscode_1.window.registerTreeDataProvider('driveView', this);
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    showUnexpectedErrorMessage(operation) {
        vscode_1.window.showWarningMessage(`'${operation}' operation canceled by unexpected error`);
    }
    buildLabel(f) {
        const label = `${f.name}`;
        return label;
    }
    //------- interface methods
    getTreeItem(id) {
        const currentFile = this.controller.getDriveFile(id);
        return {
            label: this.buildLabel(currentFile)
        };
    }
    getChildren() {
        return new Promise((resolve, _reject) => {
            const idArray = this.controller.getAllDriveFileIds();
            resolve(idArray);
        });
    }
}
exports.DriveView = DriveView;
//# sourceMappingURL=driveView.js.map