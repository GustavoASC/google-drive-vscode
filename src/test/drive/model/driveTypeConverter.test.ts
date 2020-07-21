import { expect } from 'chai';
import 'mocha';
import { FileType } from '../../../drive/model/driveTypes';
import { FOLDER_MIME_TYPE, DriveTypeConverter } from '../../../drive/model/driveTypeConverter';

describe('Drive type conversions from Google Drive API', () => {

    it('Empty result', async () => {
        const apiFolders: any[] = [];
        const converted = new DriveTypeConverter().fromApiToTypescript(apiFolders);
        expect(0).to.equal(converted.length);
    });

    it('Directory missing date', async () => {
        const apiFolders: any[] = [];
        apiFolders.push({id: 'ajsbo1j218fmxxnmaiouasion', name: 'foo', iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder', mimeType: FOLDER_MIME_TYPE});
        const converted = new DriveTypeConverter().fromApiToTypescript(apiFolders);
        expect(1).to.equal(converted.length);
        expect('ajsbo1j218fmxxnmaiouasion').to.equal(converted[0].id);
        expect('foo').to.equal(converted[0].name);
        expect('https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder').to.equal(converted[0].iconLink);
        expect(FileType.DIRECTORY).to.equal(converted[0].type);
        expect(undefined).to.equal(converted[0].parent);
        expect(0).to.equal(converted[0].size);
        expect(0).to.equal(converted[0].createdTime);
        expect(0).to.equal(converted[0].modifiedTime);
    });

    it('Contains only folders', async () => {
        const apiFolders: any[] = [];
        apiFolders.push({id: 'ajsbo1j218fmxxnmaiouasion', name: 'foo', iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder', mimeType: FOLDER_MIME_TYPE, createdTime:'2020-07-16T23:23:40.311Z', modifiedTime:'2020-07-20T22:44:38.263Z' });
        apiFolders.push({id: 'sdasg32453255gnmaiouasion', name: 'bar', iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder', mimeType: FOLDER_MIME_TYPE, createdTime:'2019-06-16T23:23:40.311Z', modifiedTime:'2020-07-20T23:44:38.263Z' });
        const converted = new DriveTypeConverter().fromApiToTypescript(apiFolders);
        expect(2).to.equal(converted.length);
        
        // Check first file information
        expect('ajsbo1j218fmxxnmaiouasion').to.equal(converted[0].id);
        expect('foo').to.equal(converted[0].name);
        expect('https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder').to.equal(converted[0].iconLink);
        expect(FileType.DIRECTORY).to.equal(converted[0].type);
        expect(undefined).to.equal(converted[0].parent);
        expect(0).to.equal(converted[0].size);
        expect(1594941820311).to.equal(converted[0].createdTime);
        expect(1595285078263).to.equal(converted[0].modifiedTime);
        
        // Check second file information
        expect('sdasg32453255gnmaiouasion').to.equal(converted[1].id);
        expect('bar').to.equal(converted[1].name);
        expect('https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder').to.equal(converted[1].iconLink);
        expect(FileType.DIRECTORY).to.equal(converted[1].type);
        expect(undefined).to.equal(converted[1].parent);
        expect(0).to.equal(converted[1].size);
        expect(1560727420311).to.equal(converted[1].createdTime);
        expect(1595288678263).to.equal(converted[1].modifiedTime);
    });

    it('Contains one folder and one file', async () => {
        const apiFolders: any[] = [];
        apiFolders.push({id: 'ajsbo1j218fmxxnmaiouasion', name: 'foo', iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder', mimeType: FOLDER_MIME_TYPE, createdTime:'2020-07-16T23:23:40.311Z', modifiedTime:'2020-07-20T22:44:38.263Z' });
        apiFolders.push({id: 'sdasg32453255gnmaiouasion', name: 'bar.txt', iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/text/plain', mimeType: 'text/plain', size: '1071', createdTime:'2019-06-16T23:23:40.311Z', modifiedTime:'2020-07-20T23:44:38.263Z'});
        const converted = new DriveTypeConverter().fromApiToTypescript(apiFolders);
        expect(2).to.equal(converted.length);
        
        // Check first file information
        expect('ajsbo1j218fmxxnmaiouasion').to.equal(converted[0].id);
        expect('foo').to.equal(converted[0].name);
        expect('https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder').to.equal(converted[0].iconLink);
        expect(FileType.DIRECTORY).to.equal(converted[0].type);
        expect(undefined).to.equal(converted[0].parent);
        expect(0).to.equal(converted[0].size);
        expect(1594941820311).to.equal(converted[0].createdTime);
        expect(1595285078263).to.equal(converted[0].modifiedTime);
        
        // Check second file information
        expect('sdasg32453255gnmaiouasion').to.equal(converted[1].id);
        expect('bar.txt').to.equal(converted[1].name);
        expect('https://drive-thirdparty.googleusercontent.com/16/type/text/plain').to.equal(converted[1].iconLink);
        expect(FileType.FILE).to.equal(converted[1].type);
        expect(undefined).to.equal(converted[1].parent);
        expect(1071).to.equal(converted[1].size);
        expect(1560727420311).to.equal(converted[1].createdTime);
        expect(1595288678263).to.equal(converted[1].modifiedTime);
    });

});
