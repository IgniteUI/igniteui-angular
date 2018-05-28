import { IgxExcelExporterOptions } from "./excel-exporter-options";
import { WorksheetDataDictionary } from "./worksheet-data-dictionary";
export declare class WorksheetData {
    private _data;
    options: IgxExcelExporterOptions;
    indexOfLastPinnedColumn: any;
    sort: any;
    private _columnCount;
    private _rowCount;
    private _dataDictionary;
    private _keys;
    private _isSpecialData;
    constructor(_data: any[], options: IgxExcelExporterOptions, indexOfLastPinnedColumn: any, sort: any);
    readonly data: any[];
    readonly columnCount: number;
    readonly rowCount: number;
    readonly isEmpty: boolean;
    readonly keys: string[];
    readonly isSpecialData: boolean;
    readonly dataDictionary: WorksheetDataDictionary;
    private initializeData();
}
