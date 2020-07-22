import { TreeItemCollapsibleState, TreeDataProvider, TreeItem, EventEmitter, Event, window, Uri, commands } from "vscode";
import { FileType, DriveFile, DriveFileUtils } from "../model/driveTypes";
import { DriveModel } from "../model/driveModel";
import { INotificator } from "./driveView";
import { CREATE_FOLDER_COMMAND } from "../../extension";

export class DriveTreeDataProvider implements TreeDataProvider<string> {

    /** Helper objects to refresh UI when a new monitor is added */
    private _onDidChangeTreeData: EventEmitter<string | undefined> = new EventEmitter<string | undefined>();
    readonly onDidChangeTreeData: Event<string | undefined> = this._onDidChangeTreeData.event;

    constructor(private model: DriveModel, private notificator: INotificator) {
        window.registerTreeDataProvider('driveView', this);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    private askToCreateFolderOnRoot(): void {
        const yesButton = 'Yes';
        this.notificator.showInformationMessage(`It looks like you don't have any folder on Google Drive accessible from this extension. Do you want to create a folder on Google Drive now?`, yesButton, 'No')
            .then(selectedButton => {
                if (selectedButton === yesButton) {
                    commands.executeCommand(CREATE_FOLDER_COMMAND);
                }
            });
    }

    private extractFileIds(files: DriveFile[]): string[] {
        const result = files.map(f => f.id);
        return result;
    }

    private buildItemFromDriveFile(currentFile: DriveFile): TreeItem {
        const iconUri = Uri.parse(currentFile.iconLink);
        const collapsible = this.detectCollapsibleState(currentFile);
        const contextValue = DriveFileUtils.extractTextFromType(currentFile.type);
        return {
            iconPath: iconUri,
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

    getTreeItem(id: string): TreeItem {
        const currentFile = this.model.getDriveFile(id);
        return currentFile ? this.buildItemFromDriveFile(currentFile) : {};
    }

    getChildren(id?: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const currentFileId = id ? id : 'root';
            this.model.listFiles(currentFileId)
                .then(files => {
                    if (currentFileId === 'root' && files.length === 0) {
                        this.askToCreateFolderOnRoot();
                    }
                    resolve(this.extractFileIds(files));
                }).catch(err => reject(err));
        });
    }

}