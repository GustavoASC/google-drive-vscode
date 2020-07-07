import { window, QuickPickItem } from "vscode";
import { DriveModel } from "./driveModel";

const FOLDER_DESCRIPTION_TEXT = 'Folder ID: ';
const FOLDER_SYMBOL_TEXT = '$(file-directory) ';
const UPLOAD_TEXT = 'Upload to current folder: ';

export class FolderSelector {

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
        const selectCurrentItem: QuickPickItem = { label: `$(cloud-upload) ${UPLOAD_TEXT}'${name}'` };
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
