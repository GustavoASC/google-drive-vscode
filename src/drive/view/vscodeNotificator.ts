import { INotificator } from "./driveView";
import { ProgressLocation, window } from "vscode";

export class VSCodeNotificator implements INotificator {

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

    showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
        return window.showInformationMessage(message, { modal: false }, ...items);
    }

    showWarningMessage(message: string): void {
        window.showWarningMessage(message);
    }

}
