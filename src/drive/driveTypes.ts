export interface DriveFile {
    id: string;
    type: FileType;
    name: string;
    iconLink: string;
}
export enum FileType {
    FILE,
    DIRECTORY
}
