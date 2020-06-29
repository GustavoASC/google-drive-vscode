"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveView = void 0;
const vscode_1 = require("vscode");
const SIGN_IN_ID = 'Click-to-sign-in-ID';
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
    showUnexpectedErrorMessage(message) {
        vscode_1.window.showWarningMessage(message);
    }
    buildSignInItem() {
        return {
            label: 'Sign in to Google Drive...',
            command: { command: 'google.drive.fetchFiles', title: 'Sign in' }
        };
    }
    buildItemFromDriveFile(currentFile) {
        const iconUri = vscode_1.Uri.parse(currentFile.iconLink);
        const iconPath = { light: iconUri, dark: iconUri };
        return {
            iconPath: iconPath,
            label: currentFile.name
        };
    }
    //------- Interface methods
    getTreeItem(id) {
        if (id === SIGN_IN_ID) {
            return this.buildSignInItem();
        }
        const currentFile = this.controller.getDriveFile(id);
        if (currentFile) {
            return this.buildItemFromDriveFile(currentFile);
        }
        return {};
    }
    getChildren() {
        return new Promise((resolve, _reject) => {
            const idArray = this.controller.getAllDriveFileIds();
            if (idArray.length == 0) {
                resolve([SIGN_IN_ID]);
            }
            else {
                resolve(idArray);
            }
        });
    }
}
exports.DriveView = DriveView;
//# sourceMappingURL=driveView.js.map