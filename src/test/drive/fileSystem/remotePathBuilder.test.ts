import { expect } from 'chai';
import 'mocha';
import { IFileProvider, DriveModel } from '../../../drive/model/driveModel';
import { DriveFile, FileType } from '../../../drive/model/driveTypes';
import { Readable } from 'stream';
import { RemotePathBuilder } from '../../../drive/fileSystem/remotePathBuilder';

describe('Remote path manipulartion', () => {

    it('Checks remote path building', async () => {
        const model = new DriveModel(new MockFileProvider());
        await model.listFiles('root');
        const pathBuilder = new RemotePathBuilder();
        expect('googledrive:///VSCode/subFolder/thirdFolder/myFile.txt#1Cdffsdfsdfsdfdfocz').to.equal(pathBuilder.buildRemotePathFromId(model, '1Cdffsdfsdfsdfdfocz'));
        expect(undefined).to.equal(pathBuilder.buildRemotePathFromId(model, 'xxxxxx'));
    });

});

class MockFileProvider implements IFileProvider {

    provideFiles(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve) => {
            const firstFolder: DriveFile = { iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXadsdssdsadsadsddsocz', name: 'VSCode', type: FileType.DIRECTORY };
            const secondFolder: DriveFile = { iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXCkxsvXO37gvfbfbdfbHihn9wocz', name: 'subFolder', type: FileType.DIRECTORY, parent: firstFolder };
            const thirdFolder: DriveFile = { iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXCkxsvXO37gCBpfaasqn9wocz', name: 'thirdFolder', type: FileType.DIRECTORY, parent: secondFolder };
            const finalFile: DriveFile = { iconLink: 'http://www.mylink.com/file', id: '1Cdffsdfsdfsdfdfocz', name: 'myFile.txt', type: FileType.FILE, parent: thirdFolder };
            resolve([finalFile]);
        });
    }

    createFolder(parentFolderId: string, folderName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    uploadFile(parentFolderId: string, fullFilePath: string, basename: string, mimeType: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    retrieveFileContentStream(fileId: string): Promise<Readable> {
        throw new Error("Method not implemented.");
    }

    renameFile(fileId: string, newName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
