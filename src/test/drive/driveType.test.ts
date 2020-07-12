import 'mocha';
import { expect } from 'chai';
import { DriveFileUtils, FileType } from '../../drive/driveTypes';

describe('Drive type operations', () => {

    it('Extract text representation from drive file type', () => {
        expect('folder').to.equal(DriveFileUtils.extractTextFromType(FileType.DIRECTORY));
        expect('file').to.equal(DriveFileUtils.extractTextFromType(FileType.FILE));
    });

});