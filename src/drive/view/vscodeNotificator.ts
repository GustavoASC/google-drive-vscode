import { INotificator } from "./driveView";
import { ProgressLocation, window } from "vscode";

export class VSCodeNotificator implements INotificator {

    showProgressMessage(message: string, task: Promise<any>): void {
        window.withProgress({
            location: ProgressLocation.Notification,
            title: message,
        }, () => {
            const p = new Promise((resolve, reject) => {
                task.then(() => resolve())
                    .catch(err => reject(err));
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
