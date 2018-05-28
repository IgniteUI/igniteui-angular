"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchModeSymbol = Symbol('WatchMode');
var CheckerPlugin = (function () {
    function CheckerPlugin() {
    }
    CheckerPlugin.prototype.apply = function (compiler) {
        compiler.plugin("run", function (params, callback) {
            compiler[exports.WatchModeSymbol] = false;
            callback();
        });
        compiler.plugin("watch-run", function (params, callback) {
            compiler[exports.WatchModeSymbol] = true;
            callback();
        });
    };
    return CheckerPlugin;
}());
exports.CheckerPlugin = CheckerPlugin;
//# sourceMappingURL=watch-mode.js.map