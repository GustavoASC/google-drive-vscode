import * as assert from 'assert';
import { DriveTreeDataProvider } from "../../../drive/view/driveTreeDataProvider";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { DriveModel } from '../../../drive/model/driveModel';
import { DriveFile, FileType } from '../../../drive/model/driveTypes';
import { AbstractMockFileProvider } from '../../drive/model/abstractFileProvider.test';
import { INotificator } from '../../../drive/view/notificator';

suite('Extension Test Suite', () => {

	test('Drive Tree Data Provider without notification', async () => {

		const model = new DriveModel(new MockFileProvider());
		const notificator = new CannotNotificate();
		const dataProvider = new DriveTreeDataProvider(model, notificator);

		// Retrieves root children
		const items = await dataProvider.getChildren(undefined)
		assert.equal(8, items.length);
		assert.equal('1C7udIKXCkxsvXO37gCBpfzrHihn9wocz', items[0]);
		assert.equal('5C7udIKXCkxsvXO37gCBpfzrHihn9wocz', items[1]);
		assert.equal('1C7udIKxCkxsvXO37gCBpfzrHihdnwocz', items[2]);
		assert.equal('1C7udIKXCkxsvXO37gCBpfzrHihn7777z', items[3]);
		assert.equal('1C7udIKXLkxsvXO37gCBpfzrHihn9wocz', items[4]);
		assert.equal('1C7udIKXCkxsvjO37gCBpfzrHihn9wocz', items[5]);
		assert.equal('1C7udIKXCkxsvXO47gCBpfzrHihn9wocz', items[6]);
		assert.equal('1C7udIKXCkxsvXO37gCBpfzDHihn9wocz', items[7]);

		// Checks folder information
		const folderTreeItem = dataProvider.getTreeItem('1C7udIKXCkxsvXO37gCBpfzrHihn9wocz');
		assert.equal('http://www.mylink.com/folder', (<vscode.Uri>folderTreeItem.iconPath).toString());
		assert.equal(vscode.TreeItemCollapsibleState.Collapsed, folderTreeItem.collapsibleState);
		assert.equal('VSCode', folderTreeItem.label);
		assert.equal('folder', folderTreeItem.contextValue);

		// Checks inexistent information
		const inexistentTreeItem = dataProvider.getTreeItem('inexistent');
		assert.equal(undefined, inexistentTreeItem.iconPath);
		assert.equal(undefined, inexistentTreeItem.collapsibleState);
		assert.equal(undefined, inexistentTreeItem.label);
		assert.equal(undefined, inexistentTreeItem.contextValue);

		// Checks file information
		const fileTreeItem = dataProvider.getTreeItem('1C7udIKXCkxsvjO37gCBpfzrHihn9wocz');
		assert.equal('http://www.mylink.com/jpg', (<vscode.Uri>fileTreeItem.iconPath).toString());
		assert.equal(vscode.TreeItemCollapsibleState.None, fileTreeItem.collapsibleState);
		assert.equal('myPicture.jpg', fileTreeItem.label);
		assert.equal('file', fileTreeItem.contextValue);

	});

	test('Drive Tree Data Provider with notification', async () => {

		const model = new DriveModel(new EmptyFileProvider());
		const notificator = new ShouldNotificate();
		const dataProvider = new DriveTreeDataProvider(model, notificator);

		// Retrieves root children
		const items = await dataProvider.getChildren(undefined)
		assert.equal(0, items.length);

		// Checks inexisting information
		const inexistentTreeItem = dataProvider.getTreeItem('1C7udIKXCkxsvXO37gCBpfzrHihn9wocz');
		assert.equal(undefined, inexistentTreeItem.iconPath);
		assert.equal(undefined, inexistentTreeItem.collapsibleState);
		assert.equal(undefined, inexistentTreeItem.label);
		assert.equal(undefined, inexistentTreeItem.contextValue);

		// Checks notification
		assert.equal(true, notificator.notificated);
	});

});


class MockFileProvider extends AbstractMockFileProvider {

	private dummyFiles: DriveFile[] = [];

	constructor() {
		super();
		this.dummyFiles.push({ iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXCkxsvXO37gCBpfzrHihn9wocz', name: 'VSCode', type: FileType.DIRECTORY, size: 0, createdTime: 1341393000000, modifiedTime: 1341393000000 });
		this.dummyFiles.push({ iconLink: 'http://www.mylink.com/pdf', id: '5C7udIKXCkxsvXO37gCBpfzrHihn9wocz', name: 'TCC.pdf', type: FileType.FILE, size: 12235, createdTime: 1341393000000, modifiedTime: 1341393000000 });
		this.dummyFiles.push({ iconLink: 'http://www.mylink.com/txt', id: '1C7udIKxCkxsvXO37gCBpfzrHihdnwocz', name: 'myFile.txt', type: FileType.FILE, size: 222, createdTime: 1341393000000, modifiedTime: 1341393000000 });
		this.dummyFiles.push({ iconLink: 'http://www.mylink.com/folder', id: '1C7udIKXCkxsvXO37gCBpfzrHihn7777z', name: 'Other folder', type: FileType.DIRECTORY, size: 126, createdTime: 1341393000000, modifiedTime: 1341393000000 });
		this.dummyFiles.push({ iconLink: 'http://www.mylink.com/csv', id: '1C7udIKXLkxsvXO37gCBpfzrHihn9wocz', name: 'myTable.csv', type: FileType.FILE, size: 636, createdTime: 1341393000000, modifiedTime: 1341393000000 });
		this.dummyFiles.push({ iconLink: 'http://www.mylink.com/jpg', id: '1C7udIKXCkxsvjO37gCBpfzrHihn9wocz', name: 'myPicture.jpg', type: FileType.FILE, size: 883235, createdTime: 1341393000000, modifiedTime: 1341393000000 });
		this.dummyFiles.push({ iconLink: 'http://www.mylink.com/png', id: '1C7udIKXCkxsvXO47gCBpfzrHihn9wocz', name: 'myOtherPicture.png', type: FileType.FILE, size: 2135, createdTime: 1341393000000, modifiedTime: 1341393000000 });
		this.dummyFiles.push({ iconLink: 'http://www.mylink.com/bmp', id: '1C7udIKXCkxsvXO37gCBpfzDHihn9wocz', name: 'myThirdPicture.bmp', type: FileType.FILE, size: 125, createdTime: 1341393000000, modifiedTime: 1341393000000 });
	}

	provideFiles(parentFolderId: string): Promise<DriveFile[]> {
		return new Promise((resolve, _reject) => {
			if (parentFolderId === 'root') {
				resolve(this.dummyFiles)
			} else {
				resolve([]);
			}
		});
	}

}



class EmptyFileProvider extends AbstractMockFileProvider {

	provideFiles(parentFolderId: string): Promise<DriveFile[]> {
		return new Promise((resolve, _reject) => {
			resolve([]);
		});
	}

}

abstract class AbstractMockNotificator implements INotificator {
	
	showProgressMessage(message: string, task: Thenable<any>): void {
		throw new Error("Method not implemented.");
	}
	
	showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
		throw new Error("Method not implemented.");
	}
	
	showWarningMessage(message: string): void {
		throw new Error("Method not implemented.");
	}

}

class CannotNotificate extends AbstractMockNotificator {

}

class ShouldNotificate extends AbstractMockNotificator {

	public notificated = false;

	showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
		assert.strictEqual(`It looks like you don't have any folder on Google Drive accessible from this extension. Do you want to create a folder on Google Drive now?`, message);
		assert.strictEqual(`Yes`, items[0]);
		assert.strictEqual(`No`, items[1]);
		assert.strictEqual(2, items.length);
		this.notificated = true;
		return new Promise((resolve: any) => { resolve() });
	}

}
