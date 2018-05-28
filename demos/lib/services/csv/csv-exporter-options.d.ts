import { IgxExporterOptionsBase } from "../exporter-common/exporter-options-base";
export declare class IgxCsvExporterOptions extends IgxExporterOptionsBase {
    private _valueDelimiter;
    private _fileType;
    constructor(fileName: string, fileType: CsvFileTypes);
    private static getExtensionFromFileType(fType);
    valueDelimiter: any;
    fileType: any;
    private setFileType(value);
    private setDelimiter(value?);
}
export declare enum CsvFileTypes {
    CSV = 0,
    TSV = 1,
    TAB = 2,
}
