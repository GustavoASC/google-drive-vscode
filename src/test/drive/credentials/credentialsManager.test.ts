import { expect } from 'chai';
import 'mocha';
import { CREDENTIALS_JSON_SERVICE, TOKENS_JSON_SERVICE, CredentialsManager, CredentialsFactory } from '../../../drive/credentials/credentialsManager';
import { fail } from 'assert';
import { KeytarCredentialsProvider } from '../../../drive/credentials/keytarCredentialsProvider';
import { EnvCredentialsProvider } from '../../../drive/credentials/envCredentialsProvider';

describe('Credentials manager', () => {

    it('Checks password resolution', async () => {
        // Prepares manager and env variables to return proper credentials
        process.env['DRIVE_CREDENTIALS'] = 'bXkgZHVtbXkgY3JlZGVudGlhbHM=';
        process.env['DRIVE_TOKEN'] = 'dGhlIGR1bW15IHRva2Vu=';
        const manager = new CredentialsManager();

        // Checks pass credentials
        const credentials = await manager.retrievePassword(CREDENTIALS_JSON_SERVICE);
        expect('my dummy credentials').to.equal(credentials);
        
        // Checks pass token
        const token = await manager.retrievePassword(TOKENS_JSON_SERVICE);
        expect('the dummy token').to.equal(token);
    });

    it('Checks credentials factory', async () => {
        // Prepares manager and env variables to return proper credentials
        const factory = new CredentialsFactory();
        delete process.env.DRIVE_CREDENTIALS;
        delete process.env.DRIVE_TOKEN;

        // Checks pass credentials
        const provider = factory.createProvider();
        if (provider instanceof EnvCredentialsProvider) {
            fail('Should not instantiate EnvCredentialsProvider when no variable is defined');
        }

        // Sets dummy content
        process.env['DRIVE_CREDENTIALS'] = 'abc';
        process.env['DRIVE_TOKEN'] = 'def';

        // Checks pass credentials
        const systemProvider = factory.createProvider();
        if (systemProvider instanceof KeytarCredentialsProvider) {
            fail('Should not instantiate KeytarCredentialsProvider when variable is defined');
        }
    });

});
