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
import { EventEmitter, Injectable, Output } from "@angular/core";
import { IgxBaseExporter } from "../exporter-common/base-export-service";
import { ExportUtilities } from "../exporter-common/export-utilities";
import { CharSeparatedValueData } from "./char-separated-value-data";
import { CsvFileTypes } from "./csv-exporter-options";
var IgxCsvExporterService = (function (_super) {
    __extends(IgxCsvExporterService, _super);
    function IgxCsvExporterService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onExportEnded = new EventEmitter();
        return _this;
    }
    IgxCsvExporterService.prototype.exportDataImplementation = function (data, options) {
        var csvData = new CharSeparatedValueData(data, options.valueDelimiter);
        this._stringData = csvData.prepareData();
        this.saveFile(options);
        this.onExportEnded.emit({ csvData: this._stringData });
    };
    IgxCsvExporterService.prototype.saveFile = function (options) {
        switch (options.fileType) {
            case CsvFileTypes.CSV:
                this.exportFile(this._stringData, options.fileName, "text/csv;charset=utf-8;");
                break;
            case CsvFileTypes.TSV:
            case CsvFileTypes.TAB:
                this.exportFile(this._stringData, options.fileName, "text/tab-separated-values;charset=utf-8;");
                break;
        }
    };
    IgxCsvExporterService.prototype.exportFile = function (data, fileName, fileType) {
        var blob = new Blob(["\ufeff", data], { type: fileType });
        ExportUtilities.saveBlobToFile(blob, fileName);
    };
    IgxCsvExporterService.decorators = [
        { type: Injectable },
    ];
    IgxCsvExporterService.propDecorators = {
        "onExportEnded": [{ type: Output },],
    };
    return IgxCsvExporterService;
}(IgxBaseExporter));
export { IgxCsvExporterService };
