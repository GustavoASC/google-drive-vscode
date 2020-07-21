export class DriveFileUtils {

    static extractTextFromType(fileType: FileType): string {
        const textType = fileType == FileType.DIRECTORY ? 'folder' : 'file';
        return textType;
    }
}

export interface DriveFile {
    id: string;
    type: FileType;
    name: string;
    iconLink: string;
    createdTime: number;
    modifiedTime: number;
    size: number;
    parent?: DriveFile;
}

export enum FileType {
    FILE,
    DIRECTORY
}
