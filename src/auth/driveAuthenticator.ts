import { env, Uri, window } from "vscode";
import { CredentialsManager } from "./credentialsManager";
import * as fs from "fs";

const { google } = require('googleapis');

const CREDENTIALS_JSON_SERVICE = 'Google Drive for VSCode - Credentials';
const TOKENS_JSON_SERVICE = 'Google Drive for VSCode - Token';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export class DriveAuthenticator {

  private oAuth2Client: any;
  private token: any;
  private credentialsManager = new CredentialsManager();

  storeApiCredentials(apiCredentialsJsonFile: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.readFile(apiCredentialsJsonFile, (err: NodeJS.ErrnoException | null, content: Buffer) => {
        if (err) return reject(err);
        this.credentialsManager.storePassword(content.toString(), CREDENTIALS_JSON_SERVICE)
          .then(() => {
            // Removes old token related to possible previous credential
            this.credentialsManager.removePassword(TOKENS_JSON_SERVICE)
              .then(() => resolve())
              .catch(err => reject());
          })
          .catch(err => reject(err));
      });
    });
  }

  authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isAuthenticated())
        return resolve(this.oAuth2Client);
      this.credentialsManager.retrievePassword(CREDENTIALS_JSON_SERVICE)
        .then(originalJson => {
          this.authorize(JSON.parse(originalJson.toString()))
            .then(() => resolve(this.oAuth2Client))
            .catch(err => reject(err));
        }).catch(err => reject(err));
    });
  }

  private isAuthenticated(): boolean {
    return this.oAuth2Client != undefined && this.token != undefined;
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
          // to ask user the needed access
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
      await env.openExternal(Uri.parse(authUrl));
      const code = await window.showInputBox({
        ignoreFocusOut: true,
        prompt: 'Paste here the auth token'
      });
      if (code) {
        this.oAuth2Client.getToken(code, (err: any, token: any) => {
          if (err) return reject(err);
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
        reject();
      }
    });
  }
}
