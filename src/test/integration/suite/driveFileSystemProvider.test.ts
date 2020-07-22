import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { DriveModel } from '../../../drive/model/driveModel';
import { DriveFile, FileType } from '../../../drive/model/driveTypes';
import { AbstractMockFileProvider } from '../../drive/model/abstractFileProvider.test';
import { DriveFileSystemProvider } from '../../../drive/fileSystem/driveFileSystemProvider';
import { Readable } from 'stream';
import * as fs from 'fs';

suite('Drive file system manipulation', () => {

	test('Checks retrieving file content from file system', async () => {
        const model = new DriveModel(new MockFileProvider());
        await model.listFiles('root');
        const uri = vscode.Uri.parse('googledrive:///VSCode/subFolder/thirdFolder/myFile.txt#1Cdffsdfsdfsdfdfocz');
        const driveFs = new DriveFileSystemProvider(model);
        const content = await driveFs.readFile(uri);
        assert.equal('this is my content', content.toString());
	});

	test('Checks file status from file system', async () => {
        const model = new DriveModel(new MockFileProvider());
        await model.listFiles('root');
        const uri = vscode.Uri.parse('googledrive:///VSCode/subFolder/thirdFolder/myFile.txt#1Cdffsdfsdfsdfdfocz');
        const driveFs = new DriveFileSystemProvider(model);
        const fsStat = await driveFs.stat(uri);
        assert.equal(vscode.FileType.File, fsStat.type);
        assert.equal(1361393000000, fsStat.ctime);
        assert.equal(7341393000000, fsStat.mtime);
        assert.equal(274, fsStat.size);
	});

});


class MockFileProvider extends AbstractMockFileProvider {

    provideFiles(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve) => {
            const firstFolder: DriveFile = { iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXadsdssdsadsadsddsocz', name: 'VSCode', type: FileType.DIRECTORY, size: 0, createdTime: 1341393000000, modifiedTime: 1341393000000 };
            const secondFolder: DriveFile = { iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXCkxsvXO37gvfbfbdfbHihn9wocz', name: 'subFolder', type: FileType.DIRECTORY, parent: firstFolder, size: 0, createdTime: 1341393000000, modifiedTime: 1341393000000 };
            const thirdFolder: DriveFile = { iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXCkxsvXO37gCBpfaasqn9wocz', name: 'thirdFolder', type: FileType.DIRECTORY, parent: secondFolder, size: 0, createdTime: 1341393000000, modifiedTime: 1341393000000 };
            const finalFile: DriveFile = { iconLink: 'http://www.mylink.com/file', id: '1Cdffsdfsdfsdfdfocz', name: 'myFile.txt', type: FileType.FILE, parent: thirdFolder, size: 274, createdTime: 1361393000000, modifiedTime: 7341393000000 };
            resolve([finalFile]);
        });
    }

    retrieveFileContentStream(fileId: string): Promise<Readable> {
        return new Promise((resolve, reject) => {
            assert.equal('1Cdffsdfsdfsdfdfocz', fileId);
            const contentStream = fs.createReadStream(__dirname + '/../../../../src/test/integration/suite/dummyText.txt');
            contentStream ? resolve(contentStream) : reject();
        });
    }

}
