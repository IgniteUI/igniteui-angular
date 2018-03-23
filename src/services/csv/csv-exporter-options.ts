import { IgxExporterOptionsBase } from "../exporter-common/exporter-options-base";

export class IgxCsvExporterOptions extends IgxExporterOptionsBase {

    private _valueDelimiter = ",";
    private _fileType: CsvFileTypes;

    constructor(fileName: string, public fileType: CsvFileTypes) {
        super(fileName, IgxCsvExporterOptions.getExtensionFromFileType(fileType));
        this._fileType = fileType;
    }

    private static getExtensionFromFileType(fileType: CsvFileTypes) {
        let extension = "";
        switch (fileType) {
            case CsvFileTypes.CSV:
                extension = ".csv";
                break;
            case CsvFileTypes.TSV:
                extension = ".tsv";
                break;
            case CsvFileTypes.TAB:
                extension = ".tab";
                break;
            // case CsvFileTypes.Other:
            //     break;
        }
        return extension;
    }

    get valueDelimiter() {
        if (!this._valueDelimiter) {
            switch (this._fileType) {
                case CsvFileTypes.CSV:
                    this._valueDelimiter = ",";
                    break;
                case CsvFileTypes.TSV:
                case CsvFileTypes.TAB:
                    this._valueDelimiter = "\t";
                    break;
            }
        }
        return this._valueDelimiter;
    }

    set valueDelimiter(value) {
        if (value !== undefined || value !== "") {
            this._valueDelimiter = value;
        }
    }
}

export enum CsvFileTypes {
    CSV,
    TSV,
    TAB
    // Other
}
