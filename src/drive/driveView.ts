import { TreeDataProvider, TreeItem, EventEmitter, Event, ProviderResult, window, Range, Uri } from "vscode";
import { DriveController } from "./driveController";
import { DriveFile } from "./driveTypes";

const SIGN_IN_ID = 'Click-to-sign-in-ID';

export class DriveView implements TreeDataProvider<string> {

    /** Helper objects to refresh UI when a new monitor is added */
    private _onDidChangeTreeData: EventEmitter<string | undefined> = new EventEmitter<string | undefined>();
    readonly onDidChangeTreeData: Event<string | undefined> = this._onDidChangeTreeData.event;

    constructor(private controller: DriveController) {
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
        return {
            iconPath: iconPath,
            label: currentFile.name
        };
    }

    //------- Interface methods

    getTreeItem(id: string): TreeItem | Thenable<TreeItem> {
        if (id === SIGN_IN_ID) {
            return this.buildSignInItem();
        }
        const currentFile = this.controller.getDriveFile(id);
        if (currentFile) {
            return this.buildItemFromDriveFile(currentFile);
        }
        return {};
    }

    getChildren(): ProviderResult<string[]> {
        return new Promise((resolve, _reject) => {
            const idArray = this.controller.getAllDriveFileIds();
            if (idArray.length == 0) {
                resolve([SIGN_IN_ID]);
            } else {
                resolve(idArray);
            }
        });
    }
}

