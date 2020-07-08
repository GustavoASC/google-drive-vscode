import { TreeItemCollapsibleState, TreeDataProvider, TreeItem, EventEmitter, Event, window, Uri, QuickPickItem, ProgressLocation, ProviderResult, SaveDialogOptions } from "vscode";
import { FileType, DriveFile } from "./driveTypes";
import { DriveModel } from "./driveModel";
import { FolderSelector } from "./folderSelector";

const SIGN_IN_ID = 'Click-to-sign-in-ID';

export class DriveView implements TreeDataProvider<string> {

    /** Helper objects to refresh UI when a new monitor is added */
    private _onDidChangeTreeData: EventEmitter<string | undefined> = new EventEmitter<string | undefined>();
    readonly onDidChangeTreeData: Event<string | undefined> = this._onDidChangeTreeData.event;
    private folderSelector: FolderSelector = new FolderSelector(this.model);

    constructor(private model: DriveModel) {
        window.registerTreeDataProvider('driveView', this);
    }

    async askForRemoteDestinationFolder(): Promise<string | undefined> {
        return this.folderSelector.askForDestinationFolder();
    }

    askForLocalDestinationFolder(suggestedPath?: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const defaultUri = suggestedPath ? Uri.parse(suggestedPath) : undefined;
            const saveOptions: SaveDialogOptions = { defaultUri: defaultUri };
            window.showSaveDialog(saveOptions).then(uri => {
                uri ? resolve(uri.fsPath) : reject('No destination selected');
            });
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    showProgressMessage(message: string, task: Thenable<any>): void {
        window.withProgress({
            location: ProgressLocation.Notification,
            title: message,
        }, () => {
            const p = new Promise(resolve => {
                task.then(() => resolve());
            });
            return p;
        });
    }

    async showInputBox(message: string): Promise<string | undefined> {
        return window.showInputBox({ placeHolder: message });
    }

    showInformationMessage(message: string): void {
        window.showInformationMessage(message);
    }

    showWarningMessage(message: string): void {
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
        const contextValue = this.detectContextValue(currentFile);
        return {
            iconPath: iconPath,
            label: currentFile.name,
            collapsibleState: collapsible,
            contextValue: contextValue
        };
    }

    private detectCollapsibleState(currentFile: DriveFile): TreeItemCollapsibleState {
        const collapsible = currentFile.type == FileType.DIRECTORY ?
            TreeItemCollapsibleState.Collapsed :
            TreeItemCollapsibleState.None;
        return collapsible;
    }

    private detectContextValue(currentFile: DriveFile): string {
        const contextValue = currentFile.type == FileType.DIRECTORY ? 'folder' : 'file';
        return contextValue;
    }

    private extractFileIds(files: DriveFile[]): string[] {
        const result = files.map(f => f.id);
        return result;
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
            const currentFileId = id ? id : 'root';
            this.model.listFiles(currentFileId)
                .then(files => resolve(this.extractFileIds(files)))
                .catch(err => reject(err));
        });
    }
}
