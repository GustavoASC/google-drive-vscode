import { DriveModel } from "./driveModel";

const FOLDER_DESCRIPTION_TEXT = 'Folder ID: ';
const FOLDER_SYMBOL_TEXT = '$(file-directory) ';
const UPLOAD_TEXT = 'Upload to current folder: ';

export class FolderSelector {

    constructor(private model: DriveModel, private provider: IPickProvider) {
    }

    async askForDestinationFolder(): Promise<string> {

        // Information about selected folders (to navigate between previously
        // selected folders)
        const selectionStack: IPickItem[] = [];

        // Fetch data from root folder on Google Drive
        let currentSelection: IPickItem = { label: 'root', description: 'root' };
        let items = await this.createPickItems(currentSelection, false);

        // Controls whether user has selected the folder or canceled folder selection
        let hasSelected = false;
        let hasCancelled = false;

        // Keeps asking user to select folder
        while (!hasSelected && !hasCancelled) {
            const selectedItem = await this.provider.showQuickPick(items);
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
                        label: description!.substring(FOLDER_DESCRIPTION_TEXT.length),
                        description: label.substring(FOLDER_SYMBOL_TEXT.length)
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
        return hasCancelled ? '' : currentSelection.label;
    }

    private async createPickItems(currentSelection: IPickItem, allowGoBack: boolean): Promise<IPickItem[]> {
        const allItems: IPickItem[] = [];
        allItems.push(this.createItemToSelectCurrent(currentSelection.description));
        if (allowGoBack) {
            allItems.push(this.createItemToGoBack());
        }
        const foldersItems = await this.createFoldersItems(currentSelection.label);
        allItems.push(...foldersItems);
        return allItems;
    }

    private createItemToSelectCurrent(name: string): IPickItem {
        const selectCurrentItem: IPickItem = { label: `$(cloud-upload) ${UPLOAD_TEXT}'${name}'`, description: '' };
        return selectCurrentItem;
    }

    private createItemToGoBack(): IPickItem {
        const goBackItem: IPickItem = { label: `$(arrow-left) Go back to previous folder`, description: '' };
        return goBackItem;
    }

    private async createFoldersItems(parentId: string): Promise<IPickItem[]> {
        const folders = await this.model.listOnlyFolders(parentId);
        const foldersItems: IPickItem[] = folders.map(f => {
            return {
                label: `${FOLDER_SYMBOL_TEXT}${f.name}`,
                description: `${FOLDER_DESCRIPTION_TEXT}${f.id}`
            }
        });
        return foldersItems;
    }

}

export interface IPickProvider {

    showQuickPick(items: IPickItem[]): Promise<IPickItem | undefined>;
}

export interface IPickItem {
    label: string,
    description: string,
}
