import { expect } from 'chai';
import 'mocha';
import { fail } from 'assert';
import { IFileProvider, DriveModel } from '../../../drive/model/driveModel';
import { DriveFile, FileType } from '../../../drive/model/driveTypes';
import * as path from "path";
import * as fs from 'fs';
import { Readable } from 'stream';

describe('Drive model operations', () => {

    it('List all files and folders from existing parent', async () => {
        const model = new DriveModel(new MockFileProvider());
        const files = await model.listFiles('abcdefghi');
        const names: string[] = ['VSCode', 'TCC.pdf', 'myFile.txt', 'Other folder', 'myTable.csv', 'myPicture.jpg', 'myOtherPicture.png', 'myThirdPicture.bmp'];
        compareFileNames(files, names);
        compareParent(files, undefined);

        // Lists the subfolder 'VSCode'
        const vscodeFiles = await model.listFiles('1C7udIKXCkxsvXO37gCBpfzrHihn9wocz');
        const vscodeNames: string[] = ['Subfolder', 'A.pdf', 'B.txt'];
        const vscodeFolderItself = model.getDriveFile('1C7udIKXCkxsvXO37gCBpfzrHihn9wocz');
        compareFileNames(vscodeFiles, vscodeNames);
        compareParent(vscodeFiles, vscodeFolderItself);
    });

    it('List only folders from existing parent', async () => {
        const model = new DriveModel(new MockFileProvider());
        const files = await model.listOnlyFolders('abcdefghi');
        const names: string[] = ['VSCode', 'Other folder'];
        compareFileNames(files, names);
    });

    it('List all files and folders from inexisting parent', async () => {
        const model = new DriveModel(new MockFileProvider());
        const files = await model.listFiles('xxxxxx');
        expect(files.length).to.equal(0);
    });

    it('List only folders from inexisting parent', async () => {
        const model = new DriveModel(new MockFileProvider());
        const files = await model.listOnlyFolders('xxxxxx');
        expect(files.length).to.equal(0);
    });

    it('Create folder', async () => {
        const model = new DriveModel(new MockFileProvider());
        await model.createFolder('abcdefghi', 'Nice folder');
        const fileNames: string[] = ['VSCode', 'TCC.pdf', 'myFile.txt', 'Other folder', 'myTable.csv', 'myPicture.jpg', 'myOtherPicture.png', 'myThirdPicture.bmp', 'Nice folder'];
        const files = await model.listFiles('abcdefghi');
        compareFileNames(files, fileNames);
        const folderNames: string[] = ['VSCode', 'Other folder', 'Nice folder'];
        const folders = await model.listOnlyFolders('abcdefghi');
        compareFileNames(folders, folderNames);
    });

    it('Upload file', async () => {
        const model = new DriveModel(new MockFileProvider());
        let baseName = await model.uploadFile('abcdefghi', path.join(__dirname, 'mockFile.txt'));
        expect(baseName).to.equal('mockFile.txt');
        baseName = await model.uploadFile('abcdefghi', path.join(__dirname, 'mockPdf.pdf'));
        expect(baseName).to.equal('mockPdf.pdf');
        baseName = await model.uploadFile('abcdefghi', path.join(__dirname, 'mockImage.jpg'));
        expect(baseName).to.equal('mockImage.jpg');
        baseName = await model.uploadFile('abcdefghi', path.join(__dirname, 'mockImage.png'));
        expect(baseName).to.equal('mockImage.png');
        baseName = await model.uploadFile('abcdefghi', path.join(__dirname, 'mockWithoutExt'));
        expect(baseName).to.equal('mockWithoutExt');
    });

    it('Download file', async () => {
        const model = new DriveModel(new MockFileProvider());
        const destination = path.join(__dirname, 'dummyDownloadedFile' + getRandomInt(0, 100) + '.txt');
        await model.downloadFile('1C7udIKXCkxsvjO37gCBpfzrHihn9wocz', destination);
        fs.readFile(destination, (err, data) => {
            if (err) fail(err);
            expect(data.toString()).to.equal('done writing data');
            fs.unlinkSync(destination);
        });
    });

    it('Download file on invalid location', async () => {
        const model = new DriveModel(new MockFileProvider());
        const destination = '/???????///\\\\////invalid-destination/file.txt'
        try {
            await model.downloadFile('1C7udIKXCkxsvjO37gCBpfzrHihn9wocz', destination);
            fail('Should have rejected');
        } catch (error) {
            expect(error).to.equal(`ENOENT: no such file or directory, open '/???????///\\\\////invalid-destination/file.txt'`);
        }
    });

    it('Rename file', async () => {
        const model = new DriveModel(new MockFileProvider());
        await model.listFiles('abcdefghi');
        await model.renameFile('1C7udIKXCkxsvjO37gCBpfzrHihn9wocz', 'novoNome.png');
        const driveFile = model.getDriveFile('1C7udIKXCkxsvjO37gCBpfzrHihn9wocz');
        expect(driveFile?.name).to.equal('novoNome.png');
    });

});

function compareFileNames(files: DriveFile[], names: string[]): void {
    expect(files.length).to.equal(names.length);
    for (let i = 0; i < files.length; i++) {
        expect(files[i].name).to.equal(names[i]);
    }
}

function compareParent(files: DriveFile[], parent: DriveFile | undefined): void {
    for (let i = 0; i < files.length; i++) {
        expect(files[i].parent).to.equal(parent);
    }
}

class MockFileProvider implements IFileProvider {

    private dummyFiles: DriveFile[] = [];
    private counter: number = 0;

    constructor() {
        this.dummyFiles.push({ iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXCkxsvXO37gCBpfzrHihn9wocz', name: 'VSCode', type: FileType.DIRECTORY });
        this.dummyFiles.push({ iconLink: 'http://www.mylink.com/pdf', id: '5C7udIKXCkxsvXO37gCBpfzrHihn9wocz', name: 'TCC.pdf', type: FileType.FILE });
        this.dummyFiles.push({ iconLink: 'http://www.mylink.com/txt', id: 'sC7udIKxCkxsvXO37gCBpfzrHihn9wocz', name: 'myFile.txt', type: FileType.FILE });
        this.dummyFiles.push({ iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXCkxsvXO37gCBpfzrHihn7777z', name: 'Other folder', type: FileType.DIRECTORY });
        this.dummyFiles.push({ iconLink: 'http://www.mylink.com/csv', id: '1C7udIKXLkxsvXO37gCBpfzrHihn9wocz', name: 'myTable.csv', type: FileType.FILE });
        this.dummyFiles.push({ iconLink: 'http://www.mylink.com/jpg', id: '1C7udIKXCkxsvjO37gCBpfzrHihn9wocz', name: 'myPicture.jpg', type: FileType.FILE });
        this.dummyFiles.push({ iconLink: 'http://www.mylink.com/png', id: '1C7udIKXCkxsvXO47gCBpfzrHihn9wocz', name: 'myOtherPicture.png', type: FileType.FILE });
        this.dummyFiles.push({ iconLink: 'http://www.mylink.com/bmp', id: '1C7udIKXCkxsvXO37gCBpfzDHihn9wocz', name: 'myThirdPicture.bmp', type: FileType.FILE });
    }

    provideFiles(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve, _reject) => {
            if (parentFolderId === 'abcdefghi') {
                resolve(this.dummyFiles)
            } else {
                if (parentFolderId === '1C7udIKXCkxsvXO37gCBpfzrHihn9wocz') {
                    const vscodeFiles: DriveFile[] = [];
                    vscodeFiles.push({ iconLink: 'http://www.mylink.com/folder', id: 'AC7udIKXCkxsvXO37gCBpfzrHihn9wocz', name: 'Subfolder', type: FileType.DIRECTORY });
                    vscodeFiles.push({ iconLink: 'http://www.mylink.com/pdf', id: 'BC7udIKXCkxsvXO37gCBpfzrHihn9wocz', name: 'A.pdf', type: FileType.FILE });
                    vscodeFiles.push({ iconLink: 'http://www.mylink.com/txt', id: 'CC7udIKxCkxsvXO37gCBpfzrHihn9wocz', name: 'B.txt', type: FileType.FILE });
                    resolve(vscodeFiles);
                } else {
                    resolve([]);
                }
            }
        });
    }

    createFolder(parentFolderId: string, folderName: string): Promise<void> {
        return new Promise((resolve) => {
            expect(parentFolderId).to.equal('abcdefghi');
            this.dummyFiles.push({ iconLink: 'http://www.mylink.com/folder', id: 'dummyFolderId', name: folderName, type: FileType.DIRECTORY })
            resolve();
        });
    }

    uploadFile(parentFolderId: string, fullFilePath: string, basename: string, mimeType: string): Promise<void> {
        return new Promise((resolve) => {
            switch (this.counter++) {
                case 0:
                    expect(parentFolderId).to.equal('abcdefghi');
                    expect(fullFilePath).to.equal(path.join(__dirname, 'mockFile.txt'));
                    expect(basename).to.equal('mockFile.txt');
                    expect(mimeType).to.equal('text/plain');
                    break;
                case 1:
                    expect(parentFolderId).to.equal('abcdefghi');
                    expect(fullFilePath).to.equal(path.join(__dirname, 'mockPdf.pdf'));
                    expect(basename).to.equal('mockPdf.pdf');
                    expect(mimeType).to.equal('application/pdf');
                    break;
                case 2:
                    expect(parentFolderId).to.equal('abcdefghi');
                    expect(fullFilePath).to.equal(path.join(__dirname, 'mockImage.jpg'));
                    expect(basename).to.equal('mockImage.jpg');
                    expect(mimeType).to.equal('image/jpeg');
                    break;
                case 3:
                    expect(parentFolderId).to.equal('abcdefghi');
                    expect(fullFilePath).to.equal(path.join(__dirname, 'mockImage.png'));
                    expect(basename).to.equal('mockImage.png');
                    expect(mimeType).to.equal('image/png');
                    break;
                case 4:
                    expect(parentFolderId).to.equal('abcdefghi');
                    expect(fullFilePath).to.equal(path.join(__dirname, 'mockWithoutExt'));
                    expect(basename).to.equal('mockWithoutExt');
                    expect(mimeType).to.equal('text/plain');
                    break;
            }
            resolve();
        });
    }

    retrieveFileContentStream(fileId: string): Promise<Readable> {
        return new Promise((resolve, reject) => {
            expect(fileId).to.equal('1C7udIKXCkxsvjO37gCBpfzrHihn9wocz');
            const contentStream = Readable.from('done writing data');
            contentStream ? resolve(contentStream) : reject();
        });
    }

    renameFile(fileId: string, newName: string): Promise<void> {
        return new Promise((resolve) => {
            expect(fileId).to.equal('1C7udIKXCkxsvjO37gCBpfzrHihn9wocz');
            expect(newName).to.equal('novoNome.png');
            resolve();
        });
    }

}

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
