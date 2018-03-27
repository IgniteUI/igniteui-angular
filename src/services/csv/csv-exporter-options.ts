import { IgxExporterOptionsBase } from "../exporter-common/exporter-options-base";

export class IgxCsvExporterOptions extends IgxExporterOptionsBase {

    private _valueDelimiter;

    constructor(fileName: string, public fileType: CsvFileTypes) {
        super(fileName, IgxCsvExporterOptions.getExtensionFromFileType(fileType));
        this.setDelimiter();
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
        }
        return extension;
    }

    get valueDelimiter() {
        return this._valueDelimiter;
    }

    set valueDelimiter(value) {
        this.setDelimiter(value);
    }

    private setDelimiter(value?) {
        if (value !== undefined && value !== "") {
            this._valueDelimiter = value;
        } else {
            switch (this.fileType) {
                case CsvFileTypes.CSV:
                    this._valueDelimiter = ",";
                    break;
                case CsvFileTypes.TSV:
                case CsvFileTypes.TAB:
                    this._valueDelimiter = "\t";
                    break;
            }
        }
    }
}

export enum CsvFileTypes {
    CSV,
    TSV,
    TAB
}
