import { TreeItemCollapsibleState, TreeDataProvider, TreeItem, EventEmitter, Event, window, Uri, ProviderResult } from "vscode";
import { FileType, DriveFile, DriveFileUtils } from "./driveTypes";
import { DriveModel } from "./driveModel";

export class DriveTreeDataProvider implements TreeDataProvider<string> {

    /** Helper objects to refresh UI when a new monitor is added */
    private _onDidChangeTreeData: EventEmitter<string | undefined> = new EventEmitter<string | undefined>();
    readonly onDidChangeTreeData: Event<string | undefined> = this._onDidChangeTreeData.event;

    constructor(private model: DriveModel) {
        window.registerTreeDataProvider('driveView', this);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    private extractFileIds(files: DriveFile[]): string[] {
        const result = files.map(f => f.id);
        return result;
    }

    private buildItemFromDriveFile(currentFile: DriveFile): TreeItem | Thenable<TreeItem> {
        const iconUri = Uri.parse(currentFile.iconLink);
        const iconPath = { light: iconUri, dark: iconUri };
        const collapsible = this.detectCollapsibleState(currentFile);
        const contextValue = DriveFileUtils.extractTextFromType(currentFile.type);
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

    //------- Interface methods

    getTreeItem(id: string): TreeItem | Thenable<TreeItem> {
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