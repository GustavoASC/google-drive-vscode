import { ICredentialsProvider } from "./credentialsManager";
import { SecretStorage } from "vscode";


export class SecretStorageCredentialsProvider implements ICredentialsProvider {

    constructor(private secretStorage: SecretStorage) {
    }
    
    getPassword(service: string, _: string): Promise<string | undefined> {
        return new Promise((resolve) => {
            this.secretStorage.get(service)
                .then(value => resolve(value));
        });
    }

    setPassword(service: string, _: string, password: string): Promise<void> {
        return new Promise((resolve) => {
            resolve(this.secretStorage.store(service, password));
        });
    }

    deletePassword(service: string, _: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.secretStorage.delete(service)
                .then(_ => resolve(true));
        })
    }

}