import { workspace, WorkspaceConfiguration, ConfigurationTarget } from "vscode";

const EXTENSION_SETTINGS_GROUP = 'google.drive';
const MISSING_CREDENTIALS = 'alertMissingCredentials';
const AUTH_PORT = 'authPort';

export class DriveExtensionSettings {

    isAlertMissingCredentials(): boolean | undefined {
        return settingsGroup().get<boolean>(MISSING_CREDENTIALS, true);
    }

    updateAlertMissingCredentials(value: boolean): Thenable<void> {
        return settingsGroup().update(MISSING_CREDENTIALS, value, ConfigurationTarget.Global);
    }

    getAuthPort(): number | undefined {
        return settingsGroup().get<number>(AUTH_PORT, 3000);
    }

}

function settingsGroup(): WorkspaceConfiguration {
    return workspace.getConfiguration(EXTENSION_SETTINGS_GROUP);
}