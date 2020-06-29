import { window } from "vscode";
import * as fs from "fs";

const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = __dirname + '/../../token.json';

export class DriveAuthenticator {

  private oAuth2Client: any;

  isAuthenticated(): boolean {
    return this.oAuth2Client != undefined;
  }

  getAuthenticationInfo(): any {
    return this.oAuth2Client;
  }

  authenticate(): void {
    // Load client secrets from a local file.
    fs.readFile(__dirname + '/../../credentials.json', (err: NodeJS.ErrnoException | null, content: Buffer) => {
      if (err) return window.showWarningMessage('Error loading client secret file:' + err);
      // Authorize a client with credentials, then call the Google Drive API.
      this.authorize(JSON.parse(content.toString()));
    });
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * 
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  private authorize(credentials: any): void {

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    this.oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err: any, token: Buffer) => {
      if (err) return this.getAccessToken(this.oAuth2Client);
      this.oAuth2Client.setCredentials(JSON.parse(token.toString()));
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * 
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   */
  private async getAccessToken(oAuth2Client: any): Promise<void> {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    window.showInformationMessage('Authorize this app by visiting this url:' + authUrl);
    var code = await window.showInputBox({});
    oAuth2Client.getToken(code, (err: any, token: any) => {
      if (err) return window.showWarningMessage('Error retrieving access token' + err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err: any) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
    });
  }

}
