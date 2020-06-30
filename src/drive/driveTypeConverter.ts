import { DriveFile, FileType } from "./driveTypes";

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder'

export class DriveTypeConverter {

    static fromApiToTypescript(apiFiles: any): DriveFile[] {
        const finalFiles: DriveFile[] = [];
        apiFiles.map((file: any) => {
            const fileType = this.detectFileType(file);
            finalFiles.push({
                id: file.id,
                name: file.name,
                iconLink: file.iconLink,
                type: fileType
            });
        });
        return finalFiles;
    }

    private static detectFileType(apiFile: any): FileType {
        const mimeType = apiFile?.mimeType;
        const fileType = mimeType == FOLDER_MIME_TYPE ? FileType.DIRECTORY : FileType.FILE;
        return fileType;
    }

}
