import { IgxExporterOptionsBase } from '../exporter-common/exporter-options-base';

/**
 * Objects of this class are used to configure the CSV exporting process.
 */
export class IgxCsvExporterOptions extends IgxExporterOptionsBase {

    private _valueDelimiter;
    private _fileType;

    constructor(fileName: string, fileType: CsvFileTypes) {
        super(fileName, IgxCsvExporterOptions.getExtensionFromFileType(fileType));
        this.setFileType(fileType);
        this.setDelimiter();
    }

    private static getExtensionFromFileType(fType: CsvFileTypes) {
        let extension = '';
        switch (fType) {
            case CsvFileTypes.CSV:
                extension = '.csv';
                break;
            case CsvFileTypes.TSV:
                extension = '.tsv';
                break;
            case CsvFileTypes.TAB:
                extension = '.tab';
                break;
            default:
                throw Error('Unsupported CSV file type!');
        }
        return extension;
    }

    /**
     * Gets the value delimiter which will be used for the exporting operation.
     * ```typescript
     * let delimiter = this.exportOptions.valueDelimiter;
     * ```
     *
     * @memberof IgxCsvExporterOptions
     */
    public get valueDelimiter() {
        return this._valueDelimiter;
    }

    /**
     * Sets a value delimiter which will overwrite the default delimiter of the selected export format.
     * ```typescript
     * this.exportOptions.valueDelimiter = '|';
     * ```
     *
     * @memberof IgxCsvExporterOptions
     */
    public set valueDelimiter(value) {
        this.setDelimiter(value);
    }

    /**
     * Gets the CSV export format.
     * ```typescript
     * let filetype = this.exportOptions.fileType;
     * ```
     *
     * @memberof IgxCsvExporterOptions
     */
    public get fileType() {
        return this._fileType;
    }

    /**
     * Sets the CSV export format.
     * ```typescript
     * this.exportOptions.fileType = CsvFileTypes.TAB;
     * ```
     *
     * @memberof IgxCsvExporterOptions
     */
    public set fileType(value) {
        this.setFileType(value);
    }

    private setFileType(value) {
        if (value !== undefined && value !== null && value !== this._fileType) {
            this._fileType = value;
            const extension = IgxCsvExporterOptions.getExtensionFromFileType(value);
            if (!this.fileName.endsWith(extension)) {
                const oldExt = '.' + this.fileName.split('.').pop();
                const newName = this.fileName.replace(oldExt, extension);
                this._fileExtension = extension;
                this.fileName = newName;
            }
        }
    }

    private setDelimiter(value?) {
        if (value !== undefined && value !== '' && value !== null) {
            this._valueDelimiter = value;
        } else {
            switch (this.fileType) {
                case CsvFileTypes.CSV:
                    this._valueDelimiter = ',';
                    break;
                case CsvFileTypes.TSV:
                case CsvFileTypes.TAB:
                    this._valueDelimiter = '\t';
                    break;
            }
        }
    }
}

/**
 * This enumeration is used to configure the default value separator
 * as well as the default file extension used when performing CSV exporting.
 */
export enum CsvFileTypes {
    /**
     * Character Separated Values, default separator is "comma", default file extension is .csv
     */
    CSV,
    /**
     * Tab Separated Values, default separator is tab, default file extension is .tsv
     */
    TSV,
    /**
     * Tab Separated Values, default separator is tab, default file extension is .tab
     */
    TAB
}
