import { zip } from 'fflate';

import { EventEmitter, Injectable } from '@angular/core';
import { ExcelElementsFactory } from './excel-elements-factory';
import { ExcelFolderTypes } from './excel-enums';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { IExcelFolder } from './excel-interfaces';
import { ExportRecordType, IExportRecord, IgxBaseExporter, DEFAULT_OWNER, ExportHeaderType, GRID_LEVEL_COL } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { WorksheetData } from './worksheet-data';
import { IBaseEventArgs } from '../../core/utils';
import { WorksheetFile } from './excel-files';

export interface IExcelExportEndedEventArgs extends IBaseEventArgs {
    xlsx?: Object
}

const EXCEL_MAX_ROWS = 1048576;
const EXCEL_MAX_COLS = 16384;

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
@Injectable({
    providedIn: 'root',
})
export class IgxExcelExporterService extends IgxBaseExporter {

    /**
     * This event is emitted when the export process finishes.
     * ```typescript
     * this.exporterService.exportEnded.subscribe((args: IExcelExportEndedEventArgs) => {
     * // put event handler code here
     * });
     * ```
     *
     * @memberof IgxExcelExporterService
     */
    public override exportEnded = new EventEmitter<IExcelExportEndedEventArgs>();

    private static async populateZipFileConfig(fileStructure: Object, folder: IExcelFolder, worksheetData: WorksheetData) {
        for (const childFolder of folder.childFolders(worksheetData)) {
            const folderInstance = ExcelElementsFactory.getExcelFolder(childFolder);
            const childStructure = fileStructure[folderInstance.folderName] = {};
            await IgxExcelExporterService.populateZipFileConfig(childStructure, folderInstance, worksheetData);
        }

        for (const childFile of folder.childFiles(worksheetData)) {
            const fileInstance = ExcelElementsFactory.getExcelFile(childFile);
            if (fileInstance instanceof WorksheetFile) {
                await (fileInstance as WorksheetFile).writeElementAsync(fileStructure, worksheetData);
            } else {
                fileInstance.writeElement(fileStructure, worksheetData);
            }
        }
    }

    protected exportDataImplementation(data: IExportRecord[], options: IgxExcelExporterOptions, done: () => void): void {
        const firstDataElement = data[0];
        const isHierarchicalGrid = firstDataElement?.type === ExportRecordType.HierarchicalGridRecord;
        const isPivotGrid = firstDataElement?.type === ExportRecordType.PivotGridRecord;

        let rootKeys;
        let columnCount;
        let columnWidths;
        let indexOfLastPinnedColumn;
        let defaultOwner;

        const columnsExceedLimit = typeof firstDataElement !== 'undefined' ?
            isHierarchicalGrid ?
                data.some(d => Object.keys(d.data).length > EXCEL_MAX_COLS) :
                Object.keys(firstDataElement.data).length > EXCEL_MAX_COLS :
            false;

        if (data.length > EXCEL_MAX_ROWS || columnsExceedLimit) {
            throw Error('The Excel file can contain up to 1,048,576 rows and 16,384 columns.');
        }

        if (typeof firstDataElement !== 'undefined') {
            let maxLevel = 0;

            data.forEach((r) => {
                maxLevel = Math.max(maxLevel, r.level);
            });

            if (maxLevel > 7) {
                throw Error('Can create an outline of up to eight levels!');
            }

            if (isHierarchicalGrid) {
                columnCount = data
                    .map(a => this._ownersMap.get(a.owner).columns.filter(c => !c.skip).length + a.level)
                    .sort((a, b) => b - a)[0];

                rootKeys = this._ownersMap.get(firstDataElement.owner).columns.filter(c => !c.skip).map(c => c.field);
                defaultOwner = this._ownersMap.get(firstDataElement.owner);
            } else {
                defaultOwner = this._ownersMap.get(DEFAULT_OWNER);
                const columns = defaultOwner.columns.filter(col => col.field !== GRID_LEVEL_COL && !col.skip && col.headerType === ExportHeaderType.ColumnHeader);

                columnWidths = defaultOwner.columnWidths;
                indexOfLastPinnedColumn = defaultOwner.indexOfLastPinnedColumn;
                columnCount = isPivotGrid ? columns.length + this.pivotGridFilterFieldsCount : columns.length;
                rootKeys = columns.map(c => c.field);
            }
        } else {
            const ownersKeys = Array.from(this._ownersMap.keys());

            defaultOwner = this._ownersMap.get(ownersKeys[0]);
            columnWidths = defaultOwner.columnWidths;
            columnCount = defaultOwner.columns.filter(col => col.field !== GRID_LEVEL_COL && !col.skip && col.headerType === ExportHeaderType.ColumnHeader).length;
        }

        const worksheetData =
            new WorksheetData(data, options, this._sort, columnCount, rootKeys, indexOfLastPinnedColumn,
                columnWidths, defaultOwner, this._ownersMap);

        const rootFolder = ExcelElementsFactory.getExcelFolder(ExcelFolderTypes.RootExcelFolder);
        const fileData = {};
        IgxExcelExporterService.populateZipFileConfig(fileData, rootFolder, worksheetData)
            .then(() => {
                zip(fileData, (_, result) => {
                    this.saveFile(result, options.fileName);
                    this.exportEnded.emit({ xlsx: fileData });
                    done();
                });
            });
    }

    private saveFile(data: Uint8Array, fileName: string): void {
        const blob = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        ExportUtilities.saveBlobToFile(blob, fileName);
    }
}
