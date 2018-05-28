var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { IgxExporterOptionsBase } from "../exporter-common/exporter-options-base";
var IgxCsvExporterOptions = (function (_super) {
    __extends(IgxCsvExporterOptions, _super);
    function IgxCsvExporterOptions(fileName, fileType) {
        var _this = _super.call(this, fileName, IgxCsvExporterOptions.getExtensionFromFileType(fileType)) || this;
        _this.setFileType(fileType);
        _this.setDelimiter();
        return _this;
    }
    IgxCsvExporterOptions.getExtensionFromFileType = function (fType) {
        var extension = "";
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
            default:
                throw Error("Unsupported CSV file type!");
        }
        return extension;
    };
    Object.defineProperty(IgxCsvExporterOptions.prototype, "valueDelimiter", {
        get: function () {
            return this._valueDelimiter;
        },
        set: function (value) {
            this.setDelimiter(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCsvExporterOptions.prototype, "fileType", {
        get: function () {
            return this._fileType;
        },
        set: function (value) {
            this.setFileType(value);
        },
        enumerable: true,
        configurable: true
    });
    IgxCsvExporterOptions.prototype.setFileType = function (value) {
        if (value !== undefined && value !== null && value !== this._fileType) {
            this._fileType = value;
            var extension = IgxCsvExporterOptions.getExtensionFromFileType(value);
            if (!this.fileName.endsWith(extension)) {
                var oldExt = "." + this.fileName.split(".").pop();
                var newName = this.fileName.replace(oldExt, extension);
                this._fileExtension = extension;
                this.fileName = newName;
            }
        }
    };
    IgxCsvExporterOptions.prototype.setDelimiter = function (value) {
        if (value !== undefined && value !== "" && value !== null) {
            this._valueDelimiter = value;
        }
        else {
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
    };
    return IgxCsvExporterOptions;
}(IgxExporterOptionsBase));
export { IgxCsvExporterOptions };
export var CsvFileTypes;
(function (CsvFileTypes) {
    CsvFileTypes[CsvFileTypes["CSV"] = 0] = "CSV";
    CsvFileTypes[CsvFileTypes["TSV"] = 1] = "TSV";
    CsvFileTypes[CsvFileTypes["TAB"] = 2] = "TAB";
})(CsvFileTypes || (CsvFileTypes = {}));
