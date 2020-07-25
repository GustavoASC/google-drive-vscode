import * as os from "os";
import { KeytarCredentialsProvider } from './keytarCredentialsProvider';

export const CREDENTIALS_JSON_SERVICE = 'Google Drive for VSCode - Credentials';
export const TOKENS_JSON_SERVICE = 'Google Drive for VSCode - Token';

export class CredentialsManager {

    private credentialsProvider = new KeytarCredentialsProvider();

    changeProvider(provider: ICredentialsProvider): void {
        this.credentialsProvider = provider;
    }

    storePassword(passContent: string, serviceName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const base64Json = Buffer.from(passContent, 'ascii').toString('base64');
            const username = os.userInfo().username;
            this.credentialsProvider.setPassword(serviceName, username, base64Json)
                .then(() => resolve())
                .catch(err => reject(err));
        });
    }

    retrievePassword(serviceName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const username = os.userInfo().username;
            this.credentialsProvider.getPassword(serviceName, username)
                .then(pass => {
                    if (pass) {
                        const originalJsonContent = Buffer.from(pass, 'base64').toString('ascii');
                        resolve(originalJsonContent);
                    } else {
                        reject();
                    }
                }).catch(err => reject(err));
        });
    }

    removePassword(serviceName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const username = os.userInfo().username;
            this.credentialsProvider.deletePassword(serviceName, username)
                .then(pass => {
                    if (pass) {
                        resolve();
                    } else {
                        reject();
                    }
                }).catch(err => reject(err));
        });
    }

}


export interface ICredentialsProvider {

    getPassword(service: string, account: string): Promise<string | null>;
    setPassword(service: string, account: string, password: string): Promise<void>;
    deletePassword(service: string, account: string): Promise<boolean>;

}