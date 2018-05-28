var ExportUtilities = (function () {
    function ExportUtilities() {
    }
    ExportUtilities.getKeysFromData = function (data) {
        var length = data.length;
        if (length === 0) {
            return [];
        }
        var dataEntry = data[0];
        var dataEntryMiddle = data[Math.floor(length / 2)];
        var dataEntryLast = data[length - 1];
        var keys1 = Object.keys(dataEntry);
        var keys2 = Object.keys(dataEntryMiddle);
        var keys3 = Object.keys(dataEntryLast);
        var keys = new Set(keys1.concat(keys2).concat(keys3));
        return !ExportUtilities.isSpecialData(data) ? Array.from(keys) : ["Column 1"];
    };
    ExportUtilities.saveBlobToFile = function (blob, fileName) {
        var a = document.createElement("a");
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, fileName);
        }
        else {
            var url = window.URL.createObjectURL(blob);
            a.download = fileName;
            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    };
    ExportUtilities.stringToArrayBuffer = function (s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i !== s.length; ++i) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    };
    ExportUtilities.isSpecialData = function (data) {
        var dataEntry = data[0];
        return (typeof dataEntry === "string" ||
            typeof dataEntry === "number" ||
            dataEntry instanceof Date);
    };
    ExportUtilities.hasValue = function (value) {
        return value !== undefined && value !== null;
    };
    return ExportUtilities;
}());
export { ExportUtilities };
