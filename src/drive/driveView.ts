import { TreeItemCollapsibleState, TreeDataProvider, TreeItem, EventEmitter, Event, window, Uri, QuickPickItem, ProgressLocation, ProviderResult } from "vscode";
import { FileType, DriveFile } from "./driveTypes";
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

    showProgressMessage(message: string, task: Thenable<any>): void {
        window.withProgress({
            location: ProgressLocation.Notification,
            title: message,
        }, (_progress, _token) => {
            const p = new Promise(resolve => {
                task.then(() => resolve());
            });
            return p;
        });
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
            if (this.model.isConnectedToRemoteDrive()) {
                // When this method is loaded from the first time we
                // assume 'root' to retrieve files and folders
                let currentFileId = id ? id : 'root';
                this.model.listFiles(currentFileId)
                    .then(files => resolve(this.extractFileIds(files)))
                    .catch(err => reject(err));
            } else {
                resolve([SIGN_IN_ID]);
            }
        });
    }
}


const FOLDER_DESCRIPTION_TEXT = 'Folder ID: ';
const FOLDER_SYMBOL_TEXT = '$(file-directory) ';
const UPLOAD_TEXT = 'Upload to current folder: ';

class FolderSelector {

    constructor(private model: DriveModel) {
    }

    async askForDestinationFolder(): Promise<string> {

        // Information about selected folders (to navigate between previously
        // selected folders)
        const selectionStack: SelectionInfo[] = [];

        // Fetch data from root folder on Google Drive
        let currentSelection: SelectionInfo = { folderId: 'root', folderName: 'root' };
        let items = await this.createPickItems(currentSelection, false);

        // Controls whether user has selected the folder or canceled folder selection
        let hasSelected = false;
        let hasCancelled = false;

        // Keeps asking user to select folder
        while (!hasSelected && !hasCancelled) {
            const selectedItem = await window.showQuickPick(items, {
                placeHolder: 'Destination folder on Google Drive',
                ignoreFocusOut: true
            });
            if (selectedItem) {

                const label = selectedItem.label;
                const description = selectedItem.description;

                // Only folders contain description, so we know we
                // need to retrieve the subfolders of the selected folder
                if (description) {

                    // Saves data from current folder to restore in case of
                    // user wants to go back to previous folder level
                    selectionStack.push(currentSelection);

                    // Extracts information about the selected item
                    currentSelection = {
                        folderId: description!.substring(FOLDER_DESCRIPTION_TEXT.length),
                        folderName: label.substring(FOLDER_SYMBOL_TEXT.length)
                    }

                    items = await this.createPickItems(currentSelection, true);

                } else {
                    // Checks whether user chose the current folder or wants to
                    // go back to previous folder level
                    if (label.includes(UPLOAD_TEXT)) {
                        hasSelected = true;
                    } else {
                        // User wants to go back to previous folder
                        currentSelection = selectionStack.pop()!;
                        const allowGoBack = selectionStack.length > 0;
                        items = await this.createPickItems(currentSelection, allowGoBack);
                    }
                }
            } else {
                hasCancelled = true;
            }
        }
        return hasCancelled ? '' : currentSelection.folderId;
    }

    private async createPickItems(currentSelection: SelectionInfo, allowGoBack: boolean): Promise<QuickPickItem[]> {
        const allItems: QuickPickItem[] = [];
        allItems.push(this.createItemToSelectCurrent(currentSelection.folderName));
        if (allowGoBack) {
            allItems.push(this.createItemToGoBack());
        }
        const foldersItems = await this.createFoldersItems(currentSelection.folderId);
        allItems.push(...foldersItems);
        return allItems;
    }

    private createItemToSelectCurrent(name: string): QuickPickItem {
        const selectCurrentItem: QuickPickItem = { label: `$(check) ${UPLOAD_TEXT}'${name}'` };
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
    folderName: string,
}
