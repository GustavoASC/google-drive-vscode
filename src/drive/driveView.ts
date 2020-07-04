import { TreeItemCollapsibleState, TreeDataProvider, TreeItem, EventEmitter, Event, ProviderResult, window, Range, Uri, ProgressLocation, QuickPickItem } from "vscode";
import { DriveFile, FileType } from "./driveTypes";
import { DriveModel } from "./driveModel";

const SIGN_IN_ID = 'Click-to-sign-in-ID';
export class DriveView implements TreeDataProvider<string> {

    /** Helper objects to refresh UI when a new monitor is added */
    private _onDidChangeTreeData: EventEmitter<string | undefined> = new EventEmitter<string | undefined>();
    readonly onDidChangeTreeData: Event<string | undefined> = this._onDidChangeTreeData.event;
    private folderSelector: FolderSelector = new FolderSelector(this.model);

    constructor(private model: DriveModel) {
        window.registerTreeDataProvider('driveView', this);
    }

    async askForDestinationFolder(): Promise<string | undefined> {
        return this.folderSelector.askForDestinationFolder();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
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
}


const FOLDER_DESCRIPTION_TEXT = 'Folder ID: ';
const FOLDER_SYMBOL_TEXT = '$(file-directory) ';
class FolderSelector {

    constructor(private model: DriveModel) {
    }

    async askForDestinationFolder(): Promise<string> {

        // Information about selected folders (to navigate between previously
        // selected folders)
        const selectionStack: SelectionInfo[] = [];

        // Information about the previous folder level
        let previousFolderId = '';
        let previousFolderName = '';

        // Data from root folder on Drive
        let currentFolderId = 'root';
        let currentFolderName = 'root';
        let items = await this.createPickItems(currentFolderId, currentFolderName, previousFolderId);

        // Controls whether user has selected the folder or canceled folder selection
        let hasSelected = false;
        let hasCancelled = false;

        // Keeps asking user to select folder
        while (!hasSelected && !hasCancelled) {
            const selectedItem = await window.showQuickPick(items, {
                placeHolder: 'Destination folder',
                ignoreFocusOut: true
            });
            if (selectedItem) {
                const label = selectedItem.label;
                const description = selectedItem.description;
                if (description) {

                    // Saves data from current folder to restore in case of
                    // user wants to go back to previous folder level
                    previousFolderId = currentFolderId;
                    previousFolderName = currentFolderName;

                    // Extracts information about the selected item
                    const selectionInfo: SelectionInfo = {
                        folderId: description!.substring(FOLDER_DESCRIPTION_TEXT.length),
                        folerName: label.substring(FOLDER_SYMBOL_TEXT.length)
                    }

                    items = await this.createPickItems(selectionInfo.folderId, selectionInfo.folerName, previousFolderId);

                    
                } else {
                    // Checks whether user chose the current folder or wants to
                    // go back to previous folder level
                    if (label.startsWith('Select current')) {
                        hasSelected = true;
                    } else {

                    }
                }
            } else {
                hasCancelled = true;
            }
        }
        return currentFolderId;
    }

    private async createPickItems(folderId: string, folderName: string, previousFolderId: string): Promise<QuickPickItem[]> {
        const allItems: QuickPickItem[] = [];

        allItems.push(this.createItemToSelectCurrent(folderName));

        if (previousFolderId) {
            allItems.push(this.createItemToGoBack());
        }

        const foldersItems = await this.createFoldersItems(folderId);
        allItems.push(...foldersItems);


        return allItems;
    }

    private createItemToSelectCurrent(name: string): QuickPickItem {
        const selectCurrentItem: QuickPickItem = { label: `Select current (${name})` };
        return selectCurrentItem;
    }

    private createItemToGoBack(): QuickPickItem {
        const goBackItem: QuickPickItem = { label: `$(arrow-left) Go back to previous folder` };
        return goBackItem;
    }

    private async createFoldersItems(parentId: string): Promise<QuickPickItem[]> {
        const folders = await this.model.listOnlyFolders(parentId);
        const foldersItems: QuickPickItem[] = folders.map(f => {
            return {
                label: `${FOLDER_SYMBOL_TEXT}${f.name}`,
                description: `${FOLDER_DESCRIPTION_TEXT}${f.id}`
            }
        });
        return foldersItems;
    }

}

interface SelectionInfo {
    folderId: string,
    folerName: string,
}
