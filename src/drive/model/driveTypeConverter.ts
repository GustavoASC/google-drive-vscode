import { DriveFile, FileType } from "./driveTypes";

export const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder'

export class DriveTypeConverter {

    fromApiToTypescript(apiFiles: any): DriveFile[] {
        const finalFiles: DriveFile[] = [];
        apiFiles.map((file: any) => {
            const fileType = this.detectFileType(file);
            const size = this.detectSize(file);
            const ctime = this.convertRfc3339ToTimestamp(file.createdTime);
            const mtime = this.convertRfc3339ToTimestamp(file.modifiedTime);
            finalFiles.push({
                id: file.id,
                name: file.name,
                iconLink: file.iconLink,
                type: fileType,
                createdTime: ctime,
                modifiedTime: mtime,
                size: size,
            });
        });
        return finalFiles;
    }

    private detectFileType(apiFile: any): FileType {
        const mimeType = apiFile?.mimeType;
        const fileType = mimeType == FOLDER_MIME_TYPE ? FileType.DIRECTORY : FileType.FILE;
        return fileType;
    }

    private detectSize(apiFile: any): number {
        const size = apiFile?.size;
        return isNaN(size) ? 0 : +size;
    }

    private convertRfc3339ToTimestamp(time: string): number {
        const timeInMillis = Date.parse(time);
        return isNaN(timeInMillis) ? 0 : timeInMillis;
    }

}
