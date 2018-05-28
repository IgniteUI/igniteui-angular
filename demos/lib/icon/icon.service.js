import { Injectable } from "@angular/core";
var IgxIconService = (function () {
    function IgxIconService() {
        this.fontSet = "material-icons";
        this.fontSetAliases = new Map();
    }
    Object.defineProperty(IgxIconService.prototype, "defaultFontSet", {
        get: function () {
            return this.fontSet;
        },
        set: function (className) {
            this.fontSet = className;
        },
        enumerable: true,
        configurable: true
    });
    IgxIconService.prototype.registerFontSetAlias = function (alias, className) {
        if (className === void 0) { className = alias; }
        this.fontSetAliases.set(alias, className);
        return this;
    };
    IgxIconService.prototype.fontSetClassName = function (alias) {
        return this.fontSetAliases.get(alias) || alias;
    };
    IgxIconService.decorators = [
        { type: Injectable },
    ];
    return IgxIconService;
}());
export { IgxIconService };
