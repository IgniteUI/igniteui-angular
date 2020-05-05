/// <reference lib="webworker" />

// import * as JSZip from 'jszip';
// import { ExcelElementsFactory } from './excel-elements-factory';
// import { IExcelFolder } from './excel-interfaces';
// import { WorksheetData } from './worksheet-data';

// function populateFolder(folder: IExcelFolder, zip: JSZip, worksheetData: WorksheetData): any {
//     for (const childFolder of folder.childFolders(worksheetData)) {
//         const folderInstance = ExcelElementsFactory.getExcelFolder(childFolder);
//         const zipFolder = zip.folder(folderInstance.folderName);
//         populateFolder(folderInstance, zipFolder, worksheetData);
//     }

//     for (const childFile of folder.childFiles(worksheetData)) {
//         const fileInstance = ExcelElementsFactory.getExcelFile(childFile);
//         fileInstance.writeElement(zip, worksheetData);
//     }
// }

addEventListener('message', ({ data }) => {
    const folder = data.folder;
    const zip = data.zip;
    const worksheetData = data.worksheetData;
    // postMessage(populateFolder(folder, zip, worksheetData));
    postMessage('');
});
