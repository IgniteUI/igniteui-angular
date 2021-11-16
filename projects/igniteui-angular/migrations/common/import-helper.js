"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// eslint-disable

/**
 * Native Node dynamic import helper
 * Only needed until TypeScript 4.5 release and `node12` options is available, see:
 * https://github.com/microsoft/TypeScript/issues/43329
 */
const nativeImport = async (name) => {
    return import(name);
};
exports.nativeImport = nativeImport;
