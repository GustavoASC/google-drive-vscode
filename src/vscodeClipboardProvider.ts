import { IClipboardProvider } from "./drive/controller/clipboardProvider";
import * as vscode from 'vscode';

export class VscodeClipboardProvider implements IClipboardProvider {

    writeToClipboard(text: string): void {
        vscode.env.clipboard.writeText(text)
    }

}
