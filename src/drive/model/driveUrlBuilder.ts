import { DriveModel } from "./driveModel";
import { DriveFile, FileType } from "./driveTypes";

const DRIVE_WEBSITE = 'https://drive.google.com';

export class DriveUrlBuilder {

    buildUrlFromId(model: DriveModel, fileId: string): string | undefined {
        const file = model.getDriveFile(fileId);
        if (file) {
            return this.buildUrlFromFile(file);
        }
        return undefined;
    }

    private buildUrlFromFile(file: DriveFile): string {
        const location = this.getFileTypeLocation(file.type);
        const finalUrl = DRIVE_WEBSITE + location + file.id;
        return finalUrl;
    }

    private getFileTypeLocation(type: FileType): string {
        return type == FileType.DIRECTORY
                               ? '/drive/folders/'
                               : '/file/d/';
    }

}
