# Google Drive for VSCode

**This extension is still being developed, so please notice that some features are not fully usable**.

Manage Google Drive files and folders directly from VSCode. This extension uses 'drive.file' scope and then can only access files and folders created on Google Drive through this extension, or have gained access with Google Picker API (to be implemented).

## Features
For now you can do the following operations on Google Drive:
   
   - **List** files
   - **Create** remote folders
   - **Upload** files

The following features will be developed on the next days:
   - **Download** files
   - **Rename** files
   - **Delete** files
   - **Select** files with Google Picker API, so one can authorize access to files created by other apps or files which have been manually uploaded to Google Drive

## Requirements
In order to use this extension you need to set up Google Drive API on your Google account.

   * Access [this link](https://developers.google.com/drive/api/v3/quickstart/nodejs) to turn on the Drive API
   * Click on 'Enable the Drive API' button
   * On the modal pop-up, make sure you have 'Desktop app' selected
   * Click 'Create'
   * Click 'Download client configuration'
   
Once you have credentials.json file, access Command Palette on VSCode and run the command: 'Google Drive: Configure credentials' and select the credentials.json file.

That's all!
