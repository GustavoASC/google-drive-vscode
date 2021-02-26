import { expect } from 'chai';
import 'mocha';
import { DriveModel } from '../../../drive/model/driveModel';
import { DriveFile, FileType } from '../../../drive/model/driveTypes';
import { AbstractMockFileProvider } from './abstractFileProvider.test';
import { RemoteUrlBuilder } from '../../../drive/model/driveUrlBuilder';

describe('Remote URL manipulation', () => {

    it('Checks remote URL building', async () => {
        const model = new DriveModel(new MockFileProvider());
        await model.listFiles('root');
        const urlBuilder = new RemoteUrlBuilder();
        expect('https://drive.google.com/file/d/1Cdffsdfsdfsdfdfocz').to.equal(urlBuilder.buildUrlFromId(model, '1Cdffsdfsdfsdfdfocz'));
        expect('https://drive.google.com/drive/folders/1C7udIKXCkxsvXO37gCBpfaasqn9wocz').to.equal(urlBuilder.buildUrlFromId(model, '1C7udIKXCkxsvXO37gCBpfaasqn9wocz'));
        expect(undefined).to.equal(urlBuilder.buildUrlFromId(model, 'xxxxxx'));
    });

});

class MockFileProvider extends AbstractMockFileProvider {

    provideFiles(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve) => {
            const firstFolder: DriveFile = { iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXadsdssdsadsadsddsocz', name: 'VSCode', type: FileType.DIRECTORY, size: 0, createdTime: 1341393000000, modifiedTime: 1341393000000 };
            const secondFolder: DriveFile = { iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXCkxsvXO37gvfbfbdfbHihn9wocz', name: 'subFolder', type: FileType.DIRECTORY, parent: firstFolder, size: 0, createdTime: 1341393000000, modifiedTime: 1341393000000 };
            const thirdFolder: DriveFile = { iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXCkxsvXO37gCBpfaasqn9wocz', name: 'thirdFolder', type: FileType.DIRECTORY, parent: secondFolder, size: 0, createdTime: 1341393000000, modifiedTime: 1341393000000 };
            const finalFile: DriveFile = { iconLink: 'http://www.mylink.com/file', id: '1Cdffsdfsdfsdfdfocz', name: 'myFile.txt', type: FileType.FILE, parent: secondFolder, size: 1325, createdTime: 1341393000000, modifiedTime: 1341393000000 };
            resolve([thirdFolder, finalFile]);
        });
    }

}
