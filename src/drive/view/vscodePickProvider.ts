import { window, QuickPickItem } from "vscode";
import { IPickProvider, IPickItem } from "./folderSelector";

export class VSCodePickProvider implements IPickProvider {

    showQuickPick(items: IPickItem[]): Promise<IPickItem | undefined> {
        return new Promise(async (resolve) => {
            const vscodeItems = this.convertItemsToVSCodeApi(items);
            const selectedItem = await window.showQuickPick(vscodeItems, {
                placeHolder: 'Destination folder on Google Drive',
                ignoreFocusOut: true
            });
            const result = selectedItem ? this.convertVSCodeApiToItem(selectedItem) : undefined;
            resolve(result);
        });
    }

    private convertItemsToVSCodeApi(items: IPickItem[]): QuickPickItem[] {
        const vscodeItems: QuickPickItem[] = [];
        items.forEach(i => {
            vscodeItems.push({
                label: i.label,
                description: i.description
            });
        });
        return vscodeItems;
    }

    private convertVSCodeApiToItem(vscodeItem: QuickPickItem): IPickItem {
        const item: IPickItem = {
            label: vscodeItem.label,
            description: vscodeItem.description!
        }
        return item;
    }

}
