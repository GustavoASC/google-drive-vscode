import { ProgressLocation, window } from "vscode";
import { INotificator } from "./notificator";

export class VSCodeNotificator implements INotificator {

    showProgressMessage(message: string, task: Promise<any>): void {
        window.withProgress({
            location: ProgressLocation.Notification,
            title: message,
        }, () => {
            const p = new Promise((resolve, reject) => {
                task.then(x => resolve(x))
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
