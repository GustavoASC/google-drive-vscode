"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveView = void 0;
const vscode_1 = require("vscode");
const driveTypes_1 = require("./driveTypes");
const SIGN_IN_ID = 'Click-to-sign-in-ID';
class DriveView {
    constructor(model) {
        this.model = model;
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
        const collapsible = this.detectCollapsibleState(currentFile);
        return {
            iconPath: iconPath,
            label: currentFile.name,
            collapsibleState: collapsible
        };
    }
    detectCollapsibleState(currentFile) {
        const collapsible = currentFile.type == driveTypes_1.FileType.DIRECTORY ? vscode_1.TreeItemCollapsibleState.Collapsed : vscode_1.TreeItemCollapsibleState.None;
        return collapsible;
    }
    //------- Interface methods
    getTreeItem(id) {
        if (id === SIGN_IN_ID) {
            return this.buildSignInItem();
        }
        const currentFile = this.model.getDriveFile(id);
        return currentFile ? this.buildItemFromDriveFile(currentFile) : {};
    }
    getChildren(id) {
        return new Promise((resolve, reject) => {
            const currentFile = id ? this.model.getDriveFile(id) : undefined;
            if (currentFile && currentFile.type == driveTypes_1.FileType.DIRECTORY) {
                this.model.listFiles(currentFile.id)
                    .then(files => resolve(this.extractFileIds(files)))
                    .catch(err => reject(err));
            }
            else {
                const idArray = this.model.getAllDriveFileIds();
                const finalArray = idArray.length == 0 ? [SIGN_IN_ID] : idArray;
                resolve(finalArray);
            }
        });
    }
    extractFileIds(files) {
        const result = files.map(f => f.id);
        return result;
    }
}
exports.DriveView = DriveView;
//# sourceMappingURL=driveView.js.map