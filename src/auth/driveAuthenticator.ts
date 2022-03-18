import { env, Uri, window, commands } from "vscode";
import { CredentialsManager, CREDENTIALS_JSON_SERVICE, TOKENS_JSON_SERVICE } from "../drive/credentials/credentialsManager";
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const destroyer = require('server-destroy');
import * as fs from "fs";
import { CONFIGURE_CREDENTIALS_COMMAND } from "../extension";

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.readonly'];

// Port and endpoint where this extension will listen for the OAuth2 token
const OAUTH_PORT = 3000;
const OAUTH_ENDPOINT = "http://127.0.0.1:" + OAUTH_PORT + "/";

export class DriveAuthenticator {

  private oAuth2Client: any;
  private token: any;

  constructor(private credentialsManager: CredentialsManager) { }

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
      this.oAuth2Client = new OAuth2Client(
        client_id,
        client_secret,
        OAUTH_ENDPOINT
      );
      this.credentialsManager.retrievePassword(TOKENS_JSON_SERVICE).then(token => {
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
      
      // This URL will be opened on external browser so the user can proceed with authentication
      const authUrl = this.oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
      window.showInformationMessage('Authorize this app by visiting the external URL');

      // Open an http server to accept the oauth callback. In this simple example, the
      // only request to our webserver is to /oauth2callback?code=<code>

      // This code was extracted from: https://github.com/googleapis/google-auth-library-nodejs
      const server = http.createServer(async (req: any, res: any) => {
        try {

          // This is called when user confirms authorization
          if (req.url.indexOf('/?code') > -1) {
            
            // Acquire the code from the querystring, and close the web server.
            const qs = new url.URL(req.url, OAUTH_ENDPOINT).searchParams;
            const authToken = qs.get('code');
            res.end('Authentication completed! Please return to VSCode.');
            
            // We do not need the server anymore, so destroy it
            server.destroy();
            // Generates a token with the code returned by the auth
            this.oAuth2Client.getToken(authToken, (err: any, token: any) => {
              
              // In case any unexpected error happens we cannot proceed
              if (err)
                return reject(err);
              
              // This token is stored globally, on this instance, so the authentication is not
              // asked again on future operations with Google Drive
              this.token = token;

              // We generate a string representation of the token so it can be stored
              const stringified = JSON.stringify(this.token);

              // We store the token on the operating system so that different VSCode instances can also
              // use this token and auth is not asked again in the future.
              this.credentialsManager.storePassword(stringified, TOKENS_JSON_SERVICE).then(() => {

                // Finally, update the credentials with the generated token
                this.oAuth2Client.setCredentials(this.token);
                window.showInformationMessage('Authorization completed! Now you can access your drive files through VSCode.');
                resolve();

              }).catch(err => {
                reject(err);
              });
            });
          }

          // This is called when user cancels the authorization
          if (req.url.indexOf('/?error') > -1) {

            // We do not need the server anymore, so destroy it
            res.end('Authorization flow canceled by user. Please return to VSCode.');
            server.destroy();

            // Finishes the authorization
            window.showWarningMessage('Authorization flow canceled by user.');
            reject();
  
          }

        } catch (err) {
          window.showErrorMessage('Unexpected problem: ' + err);
          reject(err);
        }
      });

      server.on('error', function (err: any) {
        window.showErrorMessage('Unexpected problem while starting HTTP server ' + OAUTH_ENDPOINT + ': ' + err);
        server.destroy();
        reject(err);
      });      

      // Effectively listens on the HTTP port until OAuth2 sends a request to it
      server.listen(OAUTH_PORT, async () => {

        // Opens the browser to the authorize url to start the workflow
        const opened = await env.openExternal(Uri.parse(authUrl));

        // User has cancelled the authorization flow
        if (!opened) {
          window.showWarningMessage('Authorization flow canceled by user.');
          return reject();
        }

      });

      // Allows this server instance to be properly destroyed
      destroyer(server);

    });
  }
}
