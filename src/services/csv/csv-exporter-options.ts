import { IgxExporterOptionsBase } from "../exporter-common/exporter-options-base";

export class IgxCsvExporterOptions extends IgxExporterOptionsBase {

    private _valueDelimiter;
    private _fileType;

    constructor(fileName: string, fileType: CsvFileTypes) {
        super(fileName, IgxCsvExporterOptions.getExtensionFromFileType(fileType));
        this.setFileType(fileType);
        this.setDelimiter();
    }

    private static getExtensionFromFileType(fType: CsvFileTypes) {
        let extension = "";
        switch (fType) {
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

    get fileType() {
        return this._fileType;
    }

    set fileType(value) {
        this.setFileType(value);
    }

    private setFileType(value) {
        if (value !== undefined && value !== null && value !== this._fileType) {
            this._fileType = value;
            const extension = IgxCsvExporterOptions.getExtensionFromFileType(value);
            if (!this.fileName.endsWith(extension)) {
                const oldExt = "." + this.fileName.split(".").pop();
                const newName = this.fileName.replace(oldExt, extension);
                this._fileExtension = extension;
                this.fileName = newName;
            }
        }
    }

    private setDelimiter(value?) {
        if (value !== undefined && value !== "" && value !== null) {
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
