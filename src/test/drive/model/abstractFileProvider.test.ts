import { IFileProvider } from "../../../drive/model/driveModel";
import { DriveFile } from "../../../drive/model/driveTypes";
import { Readable } from "stream";

export abstract class AbstractMockFileProvider implements IFileProvider {
    
    provideFiles(parentFolderId: string): Promise<DriveFile[]> {
        throw new Error("Method not implemented.");
    }

    createFolder(parentFolderId: string, folderName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    uploadFile(parentFolderId: string, fullFilePath: string, basename: string, mimeType: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    retrieveFileContentStream(fileId: string): Promise<Readable> {
        throw new Error("Method not implemented.");
    }

    renameFile(fileId: string, newName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}