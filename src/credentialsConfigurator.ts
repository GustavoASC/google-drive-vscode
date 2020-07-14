import { DriveExtensionSettings } from "./driveExtensionSettings";
import { DriveAuthenticator } from "./auth/driveAuthenticator";
import { window } from "vscode";

export class CredentialsConfigurator {

    private settings = new DriveExtensionSettings();

    constructor(private authenticator: DriveAuthenticator) { }

    checkCredentialsConfigured(): void {
        if (this.settings.isAlertMissingCredentials()) {
            this.authenticator.checkCredentialsConfigured()
                .then(() => { })
                .catch(() => {
                    const yesButton = 'Yes';
                    const dontShowAgain = `Don't show again`;
                    window.showInformationMessage(`It looks like you don't have Google Drive API credentials configured yet. Do you want to configure them now?`, yesButton, 'No', dontShowAgain)
                        .then((selectedButton) => {
                            switch (selectedButton) {
                                case yesButton:
                                    this.configureCredentials();
                                    break;
                                case dontShowAgain:
                                    this.settings.updateAlertMissingCredentials(false);
                                    break;
                            }
                        });
                });
        }
    }

    configureCredentials(): void {
        window.showInformationMessage('Please select the credentials.json file previously generated from your Google API Console.')
        window.showOpenDialog({}).then(files => {
            if (files && files.length > 0) {
                const selectedCredentialsFile = files[0].fsPath;
                this.authenticator.storeApiCredentials(selectedCredentialsFile)
                    .then(() => window.showInformationMessage('Credentials successfully stored!'))
                    .catch(err => window.showErrorMessage(err));
            } else {
                window.showWarningMessage(`'Configure credentials' operation canceled by user.`);
            }
        });
    }

}
