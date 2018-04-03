import * as JSZip from "jszip/dist/jszip";

export interface IRowExportingEventArgs {
    rowData: any;
    rowIndex: number;
    cancel: boolean;
}

export interface IColumnExportingEventArgs {
    header: string;
    columnIndex: number;
    cancel: boolean;
}

export interface ICsvExportEndedEventArgs {
    csvData: string;
}

export interface IExcelExportEndedEventArgs {
    xlsx: JSZip;
}
