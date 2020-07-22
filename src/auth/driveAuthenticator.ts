import { env, Uri, window, commands } from "vscode";
import { CredentialsManager, CREDENTIALS_JSON_SERVICE, TOKENS_JSON_SERVICE } from "../drive/credentials/credentialsManager";
const { google } = require('googleapis');
import * as fs from "fs";
import { CONFIGURE_CREDENTIALS_COMMAND } from "../extension";

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export class DriveAuthenticator {

  private oAuth2Client: any;
  private token: any;
  private credentialsManager = new CredentialsManager();

  checkCredentialsConfigured(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.credentialsManager.retrievePassword(CREDENTIALS_JSON_SERVICE)
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  storeApiCredentials(apiCredentialsJsonFile: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.readFile(apiCredentialsJsonFile, (err: NodeJS.ErrnoException | null, content: Buffer) => {
        if (err) {
          return reject(err);
        }
        this.credentialsManager.storePassword(content.toString(), CREDENTIALS_JSON_SERVICE)
          .then(() => {
            // Credentials have been successfully stored.
            // So, we need to check whether any remaining auth token exists
            this.credentialsManager.retrievePassword(TOKENS_JSON_SERVICE)
              .then(() => {

                // A remaining auth token really exists, so remove it
                // from operating system key vault
                this.credentialsManager.removePassword(TOKENS_JSON_SERVICE)
                  .then(() => resolve())
                  .catch(err => reject(err));


                resolve();
              }).catch(() => {

                // It's okay to be here because there was no remaining
                // auth token
                resolve()
              });
          })
          .catch(err => reject(err));
      });
    });
  }

  authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {

      // Checks whether the authorization flow has already
      // been done before
      if (this.isAuthenticated()) {
        return resolve(this.oAuth2Client);
      }

      // Authentication needs to be done before any operation on 
      // Google Drive API
      this.credentialsManager.retrievePassword(CREDENTIALS_JSON_SERVICE)
        .then(originalJson => {

          // User has already configured credentials.json so use it to
          // proceed with the authorization flow 
          const credentialsJson = JSON.parse(originalJson.toString());
          this.authorize(credentialsJson)
            .then(() => resolve(this.oAuth2Client))
            .catch(err => reject(err));

        }).catch(err => {

          // Credentials have not been configured yet, so there is no way to proceed
          // with authorization flow
          this.showMissingCredentialsMessage();

          // Rejects current authentication
          reject(err);

        });
    });
  }

  private showMissingCredentialsMessage(): void {
    const configureButton = 'Configure credentials';
    window.showWarningMessage(`The operation cannot proceed since Google Drive API credentials haven't been configured. Please configure the credentials and try again.`, configureButton)
      .then(selectedButton => {
        if (selectedButton === configureButton) {
          commands.executeCommand(CONFIGURE_CREDENTIALS_COMMAND);
        }
      });
  }

  private isAuthenticated(): boolean {
    return this.oAuth2Client && this.token;
  }

  private authorize(credentials: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const { client_secret, client_id, redirect_uris } = credentials.installed;
      this.oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );
      this.credentialsManager.retrievePassword(TOKENS_JSON_SERVICE)
        .then(token => {
          const tokenJson = JSON.parse(token.toString());
          this.oAuth2Client.setCredentials(tokenJson);
          resolve();
        }).catch(() => {
          // We don't have the auth token yet, so open external browser
          // to ask user the required access
          this.getAccessToken()
            .then(() => resolve())
            .catch((err) => reject(err));
        });
    });
  }

  private async getAccessToken(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const authUrl = this.oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
      window.showInformationMessage('Authorize this app by visiting the external URL and paste in the auth token');
      const opened = await env.openExternal(Uri.parse(authUrl));
      if (!opened) {
        // User has cancelled the authorization flow
        window.showWarningMessage('Authorization flow canceled by user.');
        return reject();
      }
      const authToken = await window.showInputBox({
        ignoreFocusOut: true,
        prompt: 'Paste here the auth token'
      });
      if (authToken) {
        this.oAuth2Client.getToken(authToken, (err: any, token: any) => {
          if (err) {
            return reject(err);
          }
          this.token = token;
          const stringified = JSON.stringify(this.token);
          this.credentialsManager.storePassword(stringified, TOKENS_JSON_SERVICE)
            .then(() => {
              this.oAuth2Client.setCredentials(this.token);
              window.showInformationMessage('Authorization completed! Now you can access your drive files through VSCode.');
              resolve();
            }).catch(err => reject(err));
        });
      } else {
        // User has cancelled the authorization flow
        window.showWarningMessage('Authorization flow canceled by user.');
        reject();
      }
    });
  }
}
