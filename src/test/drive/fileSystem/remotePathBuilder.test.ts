import { expect } from 'chai';
import 'mocha';
import { DriveModel } from '../../../drive/model/driveModel';
import { DriveFile, FileType } from '../../../drive/model/driveTypes';
import { RemotePathBuilder } from '../../../drive/fileSystem/remotePathBuilder';
import { AbstractMockFileProvider } from '../model/abstractFileProvider.test';

describe('Remote path manipulation', () => {

    it('Checks remote path building', async () => {
        const model = new DriveModel(new MockFileProvider());
        await model.listFiles('root');
        const pathBuilder = new RemotePathBuilder();
        expect('googledrive:///VSCode/subFolder/thirdFolder/myFile.txt#1Cdffsdfsdfsdfdfocz').to.equal(pathBuilder.buildRemotePathFromId(model, '1Cdffsdfsdfsdfdfocz'));
        expect(undefined).to.equal(pathBuilder.buildRemotePathFromId(model, 'xxxxxx'));
    });

});

class MockFileProvider extends AbstractMockFileProvider {

    provideFiles(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve) => {
            const firstFolder: DriveFile = { iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXadsdssdsadsadsddsocz', name: 'VSCode', type: FileType.DIRECTORY, size: 0, createdTime: 1341393000000, modifiedTime: 1341393000000 };
            const secondFolder: DriveFile = { iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXCkxsvXO37gvfbfbdfbHihn9wocz', name: 'subFolder', type: FileType.DIRECTORY, parent: firstFolder, size: 0, createdTime: 1341393000000, modifiedTime: 1341393000000 };
            const thirdFolder: DriveFile = { iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXCkxsvXO37gCBpfaasqn9wocz', name: 'thirdFolder', type: FileType.DIRECTORY, parent: secondFolder, size: 0, createdTime: 1341393000000, modifiedTime: 1341393000000 };
            const finalFile: DriveFile = { iconLink: 'http://www.mylink.com/file', id: '1Cdffsdfsdfsdfdfocz', name: 'myFile.txt', type: FileType.FILE, parent: thirdFolder, size: 1325, createdTime: 1341393000000, modifiedTime: 1341393000000 };
            resolve([finalFile]);
        });
    }

}
