import { DriveModel } from "./driveModel";
import { DriveFile, FileType } from "./driveTypes";

const DRIVE_WEBSITE = 'https://drive.google.com';

export class RemoteUrlBuilder {

    buildUrlFromId(model: DriveModel, fileId: string): string | undefined {
        const file = model.getDriveFile(fileId);
        if (file) {
            return this.buildUrlFromFile(file);
        }
        return undefined;
    }

    private buildUrlFromFile(file: DriveFile): string {
         const urlPath = DRIVE_WEBSITE + this.getLocation(file.type);
         const finalUrl = urlPath + file.id;
         return finalUrl;
    }

    private getLocation(type: FileType): string {
        return type == FileType.DIRECTORY
                               ? '/drive/folders/'
                               : '/file/d/';
    }

}
