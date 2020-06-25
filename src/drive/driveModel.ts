export class DriveModel {

    private allFiles: Map<number, DriveFile> = new Map();

    constructor() {
        this.allFiles.set(1, { type: FileType.FILE, name: "Meu arquivo" });
        this.allFiles.set(2, { type: FileType.FILE, name: "Outro arquivo" });
    }

    getAllDriveFileIds(): number[] {
        const idArray: number[] = [];
        this.allFiles.forEach((_file, id) => {
            idArray.push(id);
        });
        return idArray;
    }

    getAllDriveFiles(): DriveFile[] {
        const filesArray: DriveFile[] = [];
        this.allFiles.forEach((file, _id) => {
            filesArray.push(file);
        });
        return filesArray;
    }

    getDriveFile(id: number): DriveFile | undefined {
        return this.allFiles.get(id);
    }
}

export interface DriveFile {
    type: FileType;
    name: string;
}

enum FileType {
    FILE,
    DIRECTORY
}
