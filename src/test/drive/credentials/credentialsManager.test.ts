import { expect } from 'chai';
import 'mocha';
import { CREDENTIALS_JSON_SERVICE, TOKENS_JSON_SERVICE, CredentialsManager } from '../../../drive/credentials/credentialsManager';
import { EnvCredentialsProvider } from '../../../drive/credentials/envCredentialsProvider';

describe('Credentials manager', () => {

    it('Checks password resolution', async () => {
        // Prepares manager and env variables to return proper credentials
        process.env['DRIVE_CREDENTIALS'] = 'bXkgZHVtbXkgY3JlZGVudGlhbHM=';
        process.env['DRIVE_TOKEN'] = 'dGhlIGR1bW15IHRva2Vu=';
        const manager = new CredentialsManager();
        manager.changeProvider(new EnvCredentialsProvider());

        // Checks pass credentials
        const credentials = await manager.retrievePassword(CREDENTIALS_JSON_SERVICE);
        expect('my dummy credentials').to.equal(credentials);
        
        // Checks pass token
        const token = await manager.retrievePassword(TOKENS_JSON_SERVICE);
        expect('the dummy token').to.equal(token);
    });

});
