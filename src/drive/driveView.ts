import { TreeDataProvider, TreeItem, EventEmitter, Event, ProviderResult, window, Range, Uri } from "vscode";
import { DriveController } from "./driveController";
import { DriveFile } from "./driveTypes";
import { URL } from "url";

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

    showUnexpectedErrorMessage(operation: string): void {
        window.showWarningMessage(`'${operation}' operation canceled by unexpected error`);
    }

    private buildLabel(f: DriveFile): string {
        const label = `${f.name}`;
        return label;
    }

    //------- interface methods

    getTreeItem(id: string): TreeItem | Thenable<TreeItem> {
        const currentFile = this.controller.getDriveFile(id);
        const iconPath = {
            light: Uri.parse(currentFile!.iconLink),
            dark: Uri.parse(currentFile!.iconLink),
          };
        return {
            iconPath: iconPath,
            label: this.buildLabel(currentFile!)
        };
    }

    getChildren(): ProviderResult<string[]> {
        return new Promise((resolve, _reject) => {
            const idArray = this.controller.getAllDriveFileIds();
            resolve(idArray);
        });
    }
}
