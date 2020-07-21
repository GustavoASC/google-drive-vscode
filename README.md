# Google Drive for VSCode

### **NOTE: This extension is still in Beta, so please notice that some features may not be totally OK**.

Manage Google Drive files and folders directly from VSCode. This extension uses 'drive.file' scope and then can only access files and folders created on Google Drive through this extension, or have gained access with Google Picker API (to be implemented).

## Features
   
### Preview file content
You can preview file content directly from VSCode with your favorite theme. This way tou don't need to download file to disk.

!['File preview' File preview](img/gif/preview.gif)

### List

!['List files' List files](img/gif/list.gif)

### Create folders

!['Create folders' Create folders](img/gif/create-folder.gif)

### Upload files

You can upload files on three different ways.

1. Selecting specific file on workspace:

!['Upload from workspace' Upload from workspace](img/gif/upload-workspace.gif)

2. Upload file which is currently open in editor.

!['Upload current' Upload current](img/gif/upload-current.gif)

3. You can also upload files from context menu, on Drive tree view.

!['Upload tree view' Upload tree view](img/gif/upload-tree-view.gif)

### Download

!['Download tree view' Download tree view](img/gif/download-tree-view.gif)

### Rename

!['Rename tree view' Rename tree view](img/gif/rename-tree-view.gif)

## Requirements
In order to use this extension you need to set up Google Drive API on your Google account.

   * Access [this link](https://developers.google.com/drive/api/v3/quickstart/nodejs) to turn on the Drive API
   * Click on 'Enable the Drive API' button
   * On the modal pop-up, make sure you have 'Desktop app' selected
   * Click 'Create'
   * Click 'Download client configuration'
   
Once you have credentials.json file, access Command Palette on VSCode and run the command: 'Google Drive: Configure credentials' and select the credentials.json file.

## Next features
The next features will be developed soon:
   - **Select** files with Google Picker API, so one can authorize access to files created by other apps or files which have been manually uploaded to Google Drive
   - **Delete** files

## Known issues
   * On versions smaller than v1.48 (Insiders), the file preview does not properly show binary data e.g. image files. v1.48 will soon be the minimum version to run this extension. 

