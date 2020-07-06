import * as keytar from 'keytar';
import * as os from "os";

export class CredentialsManager {

    storePassword(passContent: string, serviceName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const base64Json = Buffer.from(passContent, 'ascii').toString('base64');
            const username = os.userInfo().username;
            keytar.setPassword(serviceName, username, base64Json)
                .then(() => resolve())
                .catch(err => reject(err));
        });
    }

    retrievePassword(serviceName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const username = os.userInfo().username;
            keytar.getPassword(serviceName, username)
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

}
