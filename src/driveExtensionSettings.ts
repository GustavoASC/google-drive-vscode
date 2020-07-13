import { workspace, WorkspaceConfiguration } from "vscode";

const EXTENSION_SETTINGS_GROUP = 'google.drive';
const MISSING_CREDENTIALS = 'alertMissingCredentials';

export class DriveExtensionSettings {

    isAlertMissingCredentials(): boolean | undefined {
        return settingsGroup().get<boolean>(MISSING_CREDENTIALS, true);
    }

    updateAlertMissingCredentials(value: boolean): Thenable<void> {
        return settingsGroup().update(MISSING_CREDENTIALS, value);
    }

}

function settingsGroup(): WorkspaceConfiguration {
    return workspace.getConfiguration(EXTENSION_SETTINGS_GROUP);
}