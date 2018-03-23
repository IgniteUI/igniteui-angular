import { EventEmitter, Injectable, Output } from "@angular/core";
import { IgxGridComponent } from "../../grid/grid.component";
import { ColumnExportingEventArgs, RowExportingEventArgs } from "../exporter-common/event-args";
import { ExportUtilities } from "../exporter-common/export-utilities";
import { CharSeparatedValueData } from "./char-separated-value-data";
import { CsvFileTypes, IgxCsvExporterOptions } from "./csv-exporter-options";

@Injectable()
export class IgxCsvExporterService {
    private _stringData: string;

    @Output()
    public onExportEnded = new EventEmitter<CSVExportEndedEventArgs>();

    @Output()
    public onColumnExport = new EventEmitter<ColumnExportingEventArgs>();

    @Output()
    public onRowExport = new EventEmitter<RowExportingEventArgs>();

    public export(grid: IgxGridComponent, options: IgxCsvExporterOptions) {
        const columnList = grid.columnList.toArray();
        const columns = new Array<any>();
        const data = new Array<any>();

        for (const column of columnList) {
            const columnHeader = column.header !== "" ? column.header : column.field;
            const columnArgs = new ColumnExportingEventArgs(columnHeader, column.index);
            const exportColumn = (options === undefined || options.exportHiddenColumns === undefined) ?
                                    true : (options.exportHiddenColumns === true) ? true : !column.hidden;

            if (exportColumn) {
                this.onColumnExport.emit(columnArgs);
            }

            if (exportColumn && !columnArgs.cancel) {
                columns.push({
                    header: columnArgs.header,
                    field: column.field
                });
            }
        }

        const exportFilteredRows = !options.exportFilteredRows &&
                                    grid.filteringExpressions !== undefined &&
                                    grid.filteringExpressions.length > 0;

        const exportAllPages = options.exportCurrentlyVisiblePageOnly && grid.paging;

        const useRowList = exportFilteredRows || exportAllPages;

        if (useRowList) {
            for (const row of grid.rowList.toArray()) {
                this.exportRow(data, row.rowData, row.index, columns);
            }
        } else {
            let index = -1;

            for (const gridRowData of grid.data) {
                this.exportRow(data, gridRowData, ++index, columns);
            }
        }

        this.exportData(data, options);
    }

    public exportData(data: any[], options: IgxCsvExporterOptions) {
        const csvData = new CharSeparatedValueData(data, options.valueDelimiter);
        this._stringData = csvData.prepareData();

        this.saveFile(options);
        this.onExportEnded.emit(new CSVExportEndedEventArgs(this._stringData));
    }

    private saveFile(options: IgxCsvExporterOptions) {
        switch (options.fileType) {
            case CsvFileTypes.CSV:
                this.saveCSVFile(this._stringData, options.fileName);
                break;
            case CsvFileTypes.TSV:
                this.saveTSVFile(this._stringData, options.fileName);
                break;
            case CsvFileTypes.TAB:
                this.saveTABFile(this._stringData, options.fileName);
                break;
            // case CsvFileTypes.Other:
            //     break;
        }
    }

    private saveCSVFile(data: string, fileName: string): void {
        // const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
        // if (navigator.msSaveBlob) { // IE 10+
        //     navigator.msSaveBlob(blob, fileName);
        // } else {
        //     const a = document.createElement("a");
        //     if (a.download !== undefined) { // feature detection
        //         // Browsers that support HTML5 download attribute
        //         const url = URL.createObjectURL(blob);
        //         a.setAttribute("href", url);
        //         a.setAttribute("download", fileName + ".csv");
        //         a.style.visibility = "hidden";
        //         document.body.appendChild(a);
        //         a.click();
        //         document.body.removeChild(a);
        //     }
        // }
        const blob = new Blob(["\ufeff", data], { type: "text/csv;charset=utf-8;" });
        ExportUtilities.saveBlobToFile(blob, fileName);
    }

    private saveTSVFile(data: string, fileName: string): void {
        const blob = new Blob(["\ufeff", data], { type: "text/tab-separated-values;charset=utf-8;" });
        ExportUtilities.saveBlobToFile(blob, fileName);
    }

    private saveTABFile(data: string, fileName: string): void {
        const blob = new Blob(["\ufeff", data], { type: "text/tab-separated-values;charset=utf-8;" });
        ExportUtilities.saveBlobToFile(blob, fileName);
    }

    private exportRow(data: any[], gridRowData: any, index: number, columns: any[]) {
        const rowData = columns.reduce((a, e) => {
                            a[e.header] = gridRowData[e.field];
                            return a;
                        }, {});

        const rowArgs = new RowExportingEventArgs(rowData, index);
        this.onRowExport.emit(rowArgs);

        if (!rowArgs.cancel) {
            data.push(rowData);
        }
    }
}

export class CSVExportEndedEventArgs {
    constructor(public csvData: string) {
    }
}
