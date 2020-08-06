import { expect } from 'chai';
import 'mocha';
import { FolderZipper } from '../../../drive/model/folderZipper';

describe('Zip operations', () => {

    it('Builds zip basename', async () => {
        const date = new Date(2020, 8, 4, 10, 45);
        const result = new FolderZipper().buildZipName('/tmp/dummy/', date);
        expect('dummy_20200904_1045.zip').to.equal(result);
    });

});
