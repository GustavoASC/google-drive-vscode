import { commands, InputBoxOptions, window, Uri, ProgressLocation, SaveDialogOptions, TextDocumentShowOptions, ViewColumn } from "vscode";
import { DriveModel } from "./driveModel";
import { FolderSelector } from "./folderSelector";
import { VSCodePickProvider } from "./vscodePickProvider";
import { DriveTreeDataProvider } from "./driveTreeDataProvider";

export class DriveView {

    private folderSelector: FolderSelector = new FolderSelector(this.model, new VSCodePickProvider());
    private driveTreeViewProvider: DriveTreeDataProvider = new DriveTreeDataProvider(this.model);

    constructor(private model: DriveModel) {
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

    openFile(fullPath: string): void {
        const options: TextDocumentShowOptions = {
            viewColumn: ViewColumn.Active,
            preview: false
        }
        commands.executeCommand('vscode.open', Uri.file(fullPath), options).then();
    }

    refresh(): void {
        this.driveTreeViewProvider.refresh();
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

    async showInputBox(message: string, value?: string): Promise<string | undefined> {
        const params: InputBoxOptions = {
            placeHolder: message,
            value: value
        }
        return window.showInputBox(params);
    }

    showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
        return window.showInformationMessage(message, { modal: false }, ...items);
    }

    showWarningMessage(message: string): void {
        window.showWarningMessage(message);
    }

}
