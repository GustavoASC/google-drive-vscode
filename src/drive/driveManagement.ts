import { DriveView } from "./driveView";
import { DriveModel, DriveFile } from "./driveModel";

export class DriveController {

    private model: DriveModel = new DriveModel();
    private view: DriveView = new DriveView(this);

    fetchFiles(): void {
        // const _files = this.model.getAllDriveFiles()
        this.view.refresh();
            // .catch(() => this.view.showUnexpectedErrorMessage('Load files'));
    }

	getAllDriveFileIds(): number[] {
		return this.model.getAllDriveFileIds();
	}

	getAllDriveFiles(): DriveFile[] {
		return this.model.getAllDriveFiles();
	}

	getDriveFile(id: number): DriveFile | undefined {
		return this.model.getDriveFile(id);
	}    

}

