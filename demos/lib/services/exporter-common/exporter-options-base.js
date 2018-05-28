var IgxExporterOptionsBase = (function () {
    function IgxExporterOptionsBase(fileName, _fileExtension) {
        this._fileExtension = _fileExtension;
        this.ignoreColumnsVisibility = false;
        this.ignoreFiltering = false;
        this.ignoreColumnsOrder = false;
        this.ignoreSorting = false;
        this.setFileName(fileName);
    }
    IgxExporterOptionsBase.prototype.setFileName = function (fileName) {
        this._fileName = fileName + (fileName.endsWith(this._fileExtension) === false ? this._fileExtension : "");
    };
    Object.defineProperty(IgxExporterOptionsBase.prototype, "fileName", {
        get: function () {
            return this._fileName;
        },
        set: function (value) {
            this.setFileName(value);
        },
        enumerable: true,
        configurable: true
    });
    return IgxExporterOptionsBase;
}());
export { IgxExporterOptionsBase };
