import { expect } from 'chai';
import 'mocha';
import { IPickProvider, IPickItem, FolderSelector } from '../../drive/folderSelector';
import { DriveModel, IFileProvider } from '../../drive/driveModel';
import { DriveFile, FileType } from '../../drive/driveTypes';
import { fail } from 'assert';

describe('Folder selection operations', () => {

    it('Test navigation through folders and select root', async () => {
        const pickProvider = new SelectSubFolderProvider();
        const model = new DriveModel(new MockFileProvider());
        const folderSelector = new FolderSelector(model, pickProvider);

        const selection = await folderSelector.askForDestinationFolder();
        expect(selection).to.be.equal('sub-folder-id');
    });

    it('Test cancel selection', async () => {
        const pickProvider = new CancelFirstFolderProvider();
        const model = new DriveModel(new MockFileProvider());
        const folderSelector = new FolderSelector(model, pickProvider);

        const selection = await folderSelector.askForDestinationFolder();
        expect(selection).to.be.equal('');
    });


});


class SelectSubFolderProvider implements IPickProvider {

    private count: number = 0;

    showQuickPick(items: IPickItem[]): Promise<IPickItem | undefined> {
        return new Promise((resolve) => {
            switch (this.count++) {
                case 0:
                    // Go to subfolder
                    resolve(items[1]);
                    break;
                case 1:
                    // Go back to previous folder
                    resolve(items[1]);
                    break;
                case 2:
                    // Go again to subfolder
                    resolve(items[1]);
                    break;
                case 3:
                    // Select subfolder
                    resolve(items[0]);
                    break;
            }
        });
    }

}

class CancelFirstFolderProvider implements IPickProvider {

    private count: number = 0;

    showQuickPick(items: IPickItem[]): Promise<IPickItem | undefined> {
        return new Promise((resolve) => {
            // Cancel selection
            resolve(undefined);
        });
    }

}

class MockFileProvider implements IFileProvider {

    provideFiles(parentFolderId: string): Promise<DriveFile[]> {
        return new Promise((resolve) => {
            const files: DriveFile[] = [];
            switch (parentFolderId) {
                case 'root':
                    files.push({ iconLink: 'http://www.mylink.com/folder', id: 'sub-folder-id', name: 'My Nice subfolder', type: FileType.DIRECTORY });
                    files.push({ iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXCkxsvXO37gCBpfzrHihn7777z', name: 'Other folder', type: FileType.DIRECTORY });
                    files.push({ iconLink: 'http://www.mylink.com/csv', id: '1C7udIKXLkxsvXO37gCBpfzrHihn9wocz', name: 'myTable.csv', type: FileType.FILE });
                    break;
                case 'sub-folder-id':
                    files.push({ iconLink: 'http://www.mylink.com/jpg', id: '1C7udIKXCkxsvjO37gCBpfzrHihn9wocz', name: 'myPicture.jpg', type: FileType.FILE });
                    files.push({ iconLink: 'http://www.mylink.com/png', id: '1C7udIKXCkxsvXO47gCBpfzrHihn9wocz', name: 'myOtherPicture.png', type: FileType.FILE });
                    files.push({ iconLink: 'http://www.mylink.com/bmp', id: '1C7udIKXCkxsvXO37gCBpfzDHihn9wocz', name: 'myThirdPicture.bmp', type: FileType.FILE });
                    break;
                default:
                    fail('Invalid parent folder');
            }
            resolve(files);
        });
    }

    createFolder(parentFolderId: string, folderName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    uploadFile(parentFolderId: string, fullFilePath: string, basename: string, mimeType: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    retrieveFileContent(fileId: string, createStreamFunction: () => NodeJS.WritableStream): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
