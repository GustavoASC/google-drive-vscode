import { ICredentialsProvider } from "./credentialsManager";
import * as keytar from 'keytar';

export class KeytarCredentialsProvider implements ICredentialsProvider {
    
    getPassword(service: string, account: string): Promise<string | null> {
        return keytar.getPassword(service, account);
    }

    setPassword(service: string, account: string, password: string): Promise<void> {
        return keytar.setPassword(service, account, password);
    }

    deletePassword(service: string, account: string): Promise<boolean> {
        return keytar.deletePassword(service, account);
    }

}