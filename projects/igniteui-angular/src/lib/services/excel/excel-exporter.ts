import * as JSZip from 'jszip/dist/jszip';

import { CommonModule } from '@angular/common';
import { Directive, EventEmitter, Injectable, NgModule, Output } from '@angular/core';

import { ExcelElementsFactory } from './excel-elements-factory';
import { ExcelFolderTypes } from './excel-enums';
import { IgxExcelExporterOptions } from './excel-exporter-options';

import {
    IExcelFile,
    IExcelFolder
} from './excel-interfaces';

import { IgxBaseExporter } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { WorksheetData } from './worksheet-data';

export interface IExcelExportEndedEventArgs {
    xlsx: JSZip;
}

/**
 * **Ignite UI for Angular Excel Exporter Service** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/exporter_excel.html)
 *
 * The Ignite UI for Angular Excel Exporter service can export data in Microsoft® Excel® format from both raw data
 * (array) or from an `IgxGrid`.
 *
 * Example:
 * ```typescript
 * public localData = [
 *   { Name: "Eric Ridley", Age: "26" },
 *   { Name: "Alanis Brook", Age: "22" },
 *   { Name: "Jonathan Morris", Age: "23" }
 * ];
 *
 * constructor(private excelExportService: IgxExcelExporterService) {
 * }
 *
 * this.excelExportService.exportData(this.localData, new IgxExcelExporterOptions("FileName"));
 * ```
 */
@Injectable()
export class IgxExcelExporterService extends IgxBaseExporter {

    private static ZIP_OPTIONS = { compression: 'DEFLATE', type: 'base64' };
    private static DATA_URL_PREFIX = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,';

    private _xlsx: JSZip;

    /**
     * This event is emitted when the export process finishes.
     * ```typescript
     * this.exporterService.onExportEnded.subscribe((args: IExcelExportEndedEventArgs) => {
     * // put event handler code here
     * });
     * ```
     * @memberof IgxExcelExporterService
     */
    @Output()
    public onExportEnded = new EventEmitter<IExcelExportEndedEventArgs>();

    private static populateFolder(folder: IExcelFolder, zip: JSZip, worksheetData: WorksheetData): any {
        for (const childFolder of folder.childFolders(worksheetData)) {
            const folderIntance = ExcelElementsFactory.getExcelFolder(childFolder);
            const zipFolder = zip.folder(folderIntance.folderName);
            IgxExcelExporterService.populateFolder(folderIntance, zipFolder, worksheetData);
        }

        for (const childFile of folder.childFiles(worksheetData)) {
            const fileInstance = ExcelElementsFactory.getExcelFile(childFile);
            fileInstance.writeElement(zip, worksheetData);
        }
    }

    protected exportDataImplementation(data: any[], options: IgxExcelExporterOptions): void {
        const worksheetData = new WorksheetData(data, options, this._indexOfLastPinnedColumn, this._sort, this._isTreeGrid);
        this._xlsx = new JSZip();

        const rootFolder = ExcelElementsFactory.getExcelFolder(ExcelFolderTypes.RootExcelFolder);
        IgxExcelExporterService.populateFolder(rootFolder, this._xlsx, worksheetData);

        this._xlsx.generateAsync(IgxExcelExporterService.ZIP_OPTIONS).then((result) => {
            this.saveFile(result, options.fileName);

            this.onExportEnded.emit({ xlsx: this._xlsx });
        });
    }

    private saveFile(data: string, fileName: string): void {
        const blob = new Blob([ExportUtilities.stringToArrayBuffer(atob(data))], {
            type: ''
        });

        ExportUtilities.saveBlobToFile(blob, fileName);
    }
}
