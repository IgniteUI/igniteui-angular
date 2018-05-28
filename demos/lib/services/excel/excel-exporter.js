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
import * as JSZip from "jszip/dist/jszip";
import { EventEmitter, Injectable, Output } from "@angular/core";
import { ExcelElementsFactory } from "./excel-elements-factory";
import { ExcelFolderTypes } from "./excel-enums";
import { IgxBaseExporter } from "../exporter-common/base-export-service";
import { ExportUtilities } from "../exporter-common/export-utilities";
import { WorksheetData } from "./worksheet-data";
var IgxExcelExporterService = (function (_super) {
    __extends(IgxExcelExporterService, _super);
    function IgxExcelExporterService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onExportEnded = new EventEmitter();
        return _this;
    }
    IgxExcelExporterService.populateFolder = function (folder, zip, worksheetData) {
        for (var _i = 0, _a = folder.childFolders(worksheetData); _i < _a.length; _i++) {
            var childFolder = _a[_i];
            var folderIntance = ExcelElementsFactory.getExcelFolder(childFolder);
            var zipFolder = zip.folder(folderIntance.folderName);
            IgxExcelExporterService.populateFolder(folderIntance, zipFolder, worksheetData);
        }
        for (var _b = 0, _c = folder.childFiles(worksheetData); _b < _c.length; _b++) {
            var childFile = _c[_b];
            var fileInstance = ExcelElementsFactory.getExcelFile(childFile);
            fileInstance.writeElement(zip, worksheetData);
        }
    };
    IgxExcelExporterService.prototype.exportDataImplementation = function (data, options) {
        var _this = this;
        var worksheetData = new WorksheetData(data, options, this._indexOfLastPinnedColumn, this._sort);
        this._xlsx = new JSZip();
        var rootFolder = ExcelElementsFactory.getExcelFolder(ExcelFolderTypes.RootExcelFolder);
        IgxExcelExporterService.populateFolder(rootFolder, this._xlsx, worksheetData);
        this._xlsx.generateAsync(IgxExcelExporterService.ZIP_OPTIONS).then(function (result) {
            _this.saveFile(result, options.fileName);
            _this.onExportEnded.emit({ xlsx: _this._xlsx });
        });
    };
    IgxExcelExporterService.prototype.saveFile = function (data, fileName) {
        var blob = new Blob([ExportUtilities.stringToArrayBuffer(atob(data))], {
            type: ""
        });
        ExportUtilities.saveBlobToFile(blob, fileName);
    };
    IgxExcelExporterService.ZIP_OPTIONS = { compression: "DEFLATE", type: "base64" };
    IgxExcelExporterService.DATA_URL_PREFIX = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";
    IgxExcelExporterService.decorators = [
        { type: Injectable },
    ];
    IgxExcelExporterService.propDecorators = {
        "onExportEnded": [{ type: Output },],
    };
    return IgxExcelExporterService;
}(IgxBaseExporter));
export { IgxExcelExporterService };
