export interface INotificator {

    showProgressMessage(message: string, task: Thenable<any>): void;
    showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined>;
    showWarningMessage(message: string): void;
}
