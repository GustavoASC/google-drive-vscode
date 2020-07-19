import { DriveModel } from "../model/driveModel";
import { DriveFile } from "../model/driveTypes";
import { DRIVE_SCHEME, DRIVE_SEPARATOR } from "./fileSystemConstants";

export class RemotePathBuilder {

    buildRemotePathFromId(model: DriveModel, fileId: string): string | undefined {
        const file = model.getDriveFile(fileId);
        if (file) {
            return this.buildRemotePathFromFile(file);
        }
        return undefined;
    }

    private buildRemotePathFromFile(file: DriveFile): string {
        let currentFile = file;
        let remotePath = currentFile.name;
        while (currentFile.parent) {
            const parent = currentFile.parent;
            remotePath = parent.name + DRIVE_SEPARATOR + remotePath;
            currentFile = parent;
        }
        const fullPath = DRIVE_SCHEME + '://' + '/' + remotePath;
        const pathUriId = fullPath + '#' + file.id
        return pathUriId;
    }

}
