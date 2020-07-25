import { expect } from 'chai';
import 'mocha';
import { EnvCredentialsProvider } from '../../../drive/credentials/envCredentialsProvider';
import { CREDENTIALS_JSON_SERVICE, TOKENS_JSON_SERVICE } from '../../../drive/credentials/credentialsManager';

describe('Environment credentials provider', () => {

    it('Check credentials name resolution', async () => {
        const provider = new EnvCredentialsProvider();
        expect('DRIVE_CREDENTIALS').to.equal(provider.resolveEnvName(CREDENTIALS_JSON_SERVICE));
        expect('DRIVE_TOKEN').to.equal(provider.resolveEnvName(TOKENS_JSON_SERVICE));
        expect('invalid').to.equal(provider.resolveEnvName('invalid-service'));
    });

});
