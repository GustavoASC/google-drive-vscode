import { commands, InputBoxOptions, window, Uri, SaveDialogOptions, TextDocumentShowOptions, ViewColumn } from "vscode";
import { DriveModel } from "../model/driveModel";
import { FolderSelector } from "./folderSelector";
import { VSCodePickProvider } from "./vscodePickProvider";
import { DriveTreeDataProvider } from "./driveTreeDataProvider";
import { VSCodeNotificator } from "./vscodeNotificator";
import { INotificator } from "./notificator";

export class DriveView implements IDriveView {

    private folderSelector: FolderSelector = new FolderSelector(this.model, new VSCodePickProvider());
    private notificator: VSCodeNotificator = new VSCodeNotificator();
    private driveTreeViewProvider: DriveTreeDataProvider = new DriveTreeDataProvider(this.model, this.notificator);

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
        const options = this.defaultOpenOptions();
        commands.executeCommand('vscode.open', Uri.file(fullPath), options);
    }

    openUri(targetUri: string): void {
        const options = this.defaultOpenOptions();
        commands.executeCommand('vscode.open', Uri.parse(targetUri), options);
    }

    private defaultOpenOptions(): TextDocumentShowOptions {
        const options: TextDocumentShowOptions = {
            viewColumn: ViewColumn.Active,
            preview: false
        }
        return options;
    }

    refresh(): void {
        this.driveTreeViewProvider.refresh();
    }

    showProgressMessage(message: string, task: Promise<any>): void {
        this.notificator.showProgressMessage(message, task);
    }

    showInputBox(message: string, value?: string): Thenable<string | undefined> {
        const params: InputBoxOptions = {
            placeHolder: message,
            value: value
        }
        return window.showInputBox(params);
    }

    showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
        return this.notificator.showInformationMessage(message, ...items);
    }

    showWarningMessage(message: string): void {
        this.notificator.showWarningMessage(message);
    }

}

export interface IDriveView extends INotificator {

    askForRemoteDestinationFolder(): Promise<string | undefined>;
    askForLocalDestinationFolder(suggestedPath?: string): Promise<string>;
    openFile(fullPath: string): void;
    openUri(targetUri: string): void;
    refresh(): void;
    showInputBox(message: string, value?: string): Thenable<string | undefined>;

}
