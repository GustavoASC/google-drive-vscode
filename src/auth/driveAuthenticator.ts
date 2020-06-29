import { env, Uri, window } from "vscode";
import * as fs from "fs";
import { rejects } from "assert";

const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = __dirname + '/../../token.json';

export class DriveAuthenticator {

  private oAuth2Client: any;

  authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isAuthenticated()) return resolve(this.oAuth2Client);
      // Load client secrets from a local file.
      fs.readFile(__dirname + '/../../credentials.json', (err: NodeJS.ErrnoException | null, content: Buffer) => {
        if (err) return reject(err);
        // Authorize a client with credentials, then call the Google Drive API.
        this.authorize(JSON.parse(content.toString()))
          .then(() => resolve(this.oAuth2Client))
          .catch(err => reject(err));
      });
    });
  }

  private isAuthenticated(): boolean {
    return this.oAuth2Client != undefined;
  }

  private authorize(credentials: any): Promise<void> {
    return new Promise((resolve, _reject) => {

      const { client_secret, client_id, redirect_uris } = credentials.installed;

      this.oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err: any, token: Buffer) => {
        if (err) {
          this.getAccessToken()
            .then(() => resolve())
            .catch((err) => rejects(err));
        } else {
          this.oAuth2Client.setCredentials(JSON.parse(token.toString()));
          resolve();
        }
      });
    });
  }

  private async getAccessToken(): Promise<void> {
    return new Promise(async (resolve, reject) => {

      const authUrl = this.oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });

      window.showInformationMessage('Authorize this app by visiting the external URL and paste in the auth token');
      await env.openExternal(Uri.parse(authUrl));

      var code = await window.showInputBox({
        ignoreFocusOut: true,
        prompt: 'Paste here the auth token'

      });

      this.oAuth2Client.getToken(code, (err: any, token: any) => {
        if (err) return reject(err);
        this.oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err: any) => {
          if (err) return reject(err);

          window.showInformationMessage('Authorization completed! Now you can access your drive files through VSCode.');

          resolve();

        });
      });
    });
  }

}
