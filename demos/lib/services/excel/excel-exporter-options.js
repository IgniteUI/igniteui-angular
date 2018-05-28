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
var IgxExcelExporterOptions = (function (_super) {
    __extends(IgxExcelExporterOptions, _super);
    function IgxExcelExporterOptions(fileName) {
        var _this = _super.call(this, fileName, ".xlsx") || this;
        _this.ignorePinning = false;
        _this.exportAsTable = true;
        return _this;
    }
    Object.defineProperty(IgxExcelExporterOptions.prototype, "columnWidth", {
        get: function () {
            return this._columnWidth;
        },
        set: function (value) {
            if (value < 0) {
                throw Error("Invalid value for column width!");
            }
            this._columnWidth = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxExcelExporterOptions.prototype, "rowHeight", {
        get: function () {
            return this._rowHeight;
        },
        set: function (value) {
            if (value < 0) {
                throw Error("Invalid value for row height!");
            }
            this._rowHeight = value;
        },
        enumerable: true,
        configurable: true
    });
    return IgxExcelExporterOptions;
}(IgxExporterOptionsBase));
export { IgxExcelExporterOptions };
