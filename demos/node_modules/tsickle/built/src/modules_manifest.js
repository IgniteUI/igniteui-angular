"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** A class that maintains the module dependency graph of output JS files. */
var ModulesManifest = (function () {
    function ModulesManifest() {
        /** Map of googmodule module name to file name */
        this.moduleToFileName = {};
        /** Map of file name to arrays of imported googmodule module names */
        this.referencedModules = {};
    }
    ModulesManifest.prototype.addManifest = function (other) {
        Object.assign(this.moduleToFileName, other.moduleToFileName);
        Object.assign(this.referencedModules, other.referencedModules);
    };
    ModulesManifest.prototype.addModule = function (fileName, module) {
        this.moduleToFileName[module] = fileName;
        this.referencedModules[fileName] = [];
    };
    ModulesManifest.prototype.addReferencedModule = function (fileName, resolvedModule) {
        this.referencedModules[fileName].push(resolvedModule);
    };
    Object.defineProperty(ModulesManifest.prototype, "modules", {
        get: function () {
            return Object.keys(this.moduleToFileName);
        },
        enumerable: true,
        configurable: true
    });
    ModulesManifest.prototype.getFileNameFromModule = function (module) {
        return this.moduleToFileName[module];
    };
    Object.defineProperty(ModulesManifest.prototype, "fileNames", {
        get: function () {
            return Object.keys(this.referencedModules);
        },
        enumerable: true,
        configurable: true
    });
    ModulesManifest.prototype.getReferencedModules = function (fileName) {
        return this.referencedModules[fileName];
    };
    return ModulesManifest;
}());
exports.ModulesManifest = ModulesManifest;

//# sourceMappingURL=modules_manifest.js.map
