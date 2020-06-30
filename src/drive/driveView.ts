import { TreeItemCollapsibleState, TreeDataProvider, TreeItem, EventEmitter, Event, ProviderResult, window, Range, Uri } from "vscode";
import { DriveController } from "./driveController";
import { DriveFile, FileType } from "./driveTypes";
import { DriveModel } from "./driveModel";

const SIGN_IN_ID = 'Click-to-sign-in-ID';

export class DriveView implements TreeDataProvider<string> {

    /** Helper objects to refresh UI when a new monitor is added */
    private _onDidChangeTreeData: EventEmitter<string | undefined> = new EventEmitter<string | undefined>();
    readonly onDidChangeTreeData: Event<string | undefined> = this._onDidChangeTreeData.event;

    constructor(private model: DriveModel) {
        window.registerTreeDataProvider('driveView', this);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    showUnexpectedErrorMessage(message: string): void {
        window.showWarningMessage(message);
    }

    private buildSignInItem(): TreeItem | Thenable<TreeItem> {
        return {
            label: 'Sign in to Google Drive...',
            command: { command: 'google.drive.fetchFiles', title: 'Sign in' }
        };
    }

    private buildItemFromDriveFile(currentFile: DriveFile): TreeItem | Thenable<TreeItem> {
        const iconUri = Uri.parse(currentFile.iconLink);
        const iconPath = { light: iconUri, dark: iconUri };
        const collapsible = this.detectCollapsibleState(currentFile);
        return {
            iconPath: iconPath,
            label: currentFile.name,
            collapsibleState: collapsible
        };
    }

    private detectCollapsibleState(currentFile: DriveFile): TreeItemCollapsibleState {
        const collapsible = currentFile.type == FileType.DIRECTORY ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None;
        return collapsible;
    }

    //------- Interface methods

    getTreeItem(id: string): TreeItem | Thenable<TreeItem> {
        if (id === SIGN_IN_ID) {
            return this.buildSignInItem();
        }
        const currentFile = this.model.getDriveFile(id);
        return currentFile ? this.buildItemFromDriveFile(currentFile) : {};
    }

    getChildren(id: string): ProviderResult<string[]> {
        return new Promise((resolve, reject) => {
            const currentFile = id ? this.model.getDriveFile(id) : undefined;
            if (currentFile && currentFile.type == FileType.DIRECTORY) {
                this.model.listFiles(currentFile.id)
                    .then(files => resolve(this.extractFileIds(files)))
                    .catch(err => reject(err));
            } else {
                const idArray = this.model.getAllDriveFileIds();
                const finalArray = idArray.length == 0 ? [SIGN_IN_ID] : idArray;
                resolve(finalArray)
            }
        });
    }

    private extractFileIds(files: DriveFile[]): string[] {
        const result = files.map(f => f.id);
        return result;
    }
}
