export declare class WorksheetDataDictionary {
    private static DEFAULT_FONT;
    private static TEXT_PADDING;
    private _dictionary;
    private _widthsDictionary;
    private _sortedKeysByValue;
    private _sortedKeysByValueAreValid;
    private _keys;
    private _keysAreValid;
    private _counter;
    private _calculateColumnWidth;
    private _columnWidths;
    private _context;
    private _columnTypeInfo;
    hasNonStringValues: boolean;
    stringsCount: number;
    constructor(columnCount: number, columnWidth: number);
    readonly columnWidths: number[];
    saveValue(value: any, column: number, isHeader: boolean): number;
    getValue(value: string): number;
    getSanitizedValue(sanitizedValue: string): number;
    getKeys(): string[];
    private getTextWidth(value);
    private getContext();
    private sanitizeValue(value);
    private dirtyKeyCollections();
}
