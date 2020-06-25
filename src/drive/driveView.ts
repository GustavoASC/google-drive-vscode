import { TreeDataProvider, TreeItem, EventEmitter, Event, ProviderResult, window, Range } from "vscode";
import { DriveController } from "./driveManagement";
import { DriveFile } from "./driveModel";

export class DriveView implements TreeDataProvider<number> {

    /** Helper objects to refresh UI when a new monitor is added */
    private _onDidChangeTreeData: EventEmitter<number | undefined> = new EventEmitter<number | undefined>();
    readonly onDidChangeTreeData: Event<number | undefined> = this._onDidChangeTreeData.event;

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

    getTreeItem(id: number): TreeItem | Thenable<TreeItem> {
        const currentFile = this.controller.getDriveFile(id);
        return {
            label: this.buildLabel(currentFile!)
        };
    }

    getChildren(): ProviderResult<number[]> {
        return new Promise((resolve, _reject) => {
            const idArray = this.controller.getAllDriveFileIds();
            resolve(idArray);
        });
    }
}
