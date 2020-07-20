import { IDriveView } from "../../../drive/view/driveView";

export abstract class AbstractDriveView implements IDriveView {

    askForRemoteDestinationFolder(): Promise<string | undefined> {
        throw new Error("Method not implemented.");
    }
    askForLocalDestinationFolder(suggestedPath?: string | undefined): Promise<string> {
        throw new Error("Method not implemented.");
    }
    openFile(fullPath: string): void {
        throw new Error("Method not implemented.");
    }
    openUri(targetUri: string): void {
        throw new Error("Method not implemented.");
    }
    refresh(): void {
        throw new Error("Method not implemented.");
    }
    showInputBox(message: string, value?: string | undefined): Thenable<string | undefined> {
        throw new Error("Method not implemented.");
    }
    showProgressMessage(message: string, task: Thenable<any>): void {
        throw new Error("Method not implemented.");
    }
    showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
        throw new Error("Method not implemented.");
    }
    showWarningMessage(message: string): void {
        throw new Error("Method not implemented.");
    }


}
