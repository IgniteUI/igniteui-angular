import { ExportUtilities } from '../exporter-common/export-utilities';

/** @hidden */
export class WorksheetDataDictionary {
    private static DEFAULT_FONT = '11pt Calibri';
    private static TEXT_PADDING = 5;

    public hasNumberValues = false;
    public hasDateValues = false;

    public stringsCount: number;

    private _dictionary: any;
    private _widthsDictionary: any;

    private _keys: string[];
    private _keysAreValid: boolean;

    private _counter: number;
    private _columnWidths: number[];
    private _context: any;

    constructor(columnCount: number, columnWidth: number, columnWidthsList: number[]) {
        this._dictionary = {};
        this._widthsDictionary = {};
        this._counter = 0;
        this.dirtyKeyCollections();

        this._columnWidths = new Array<number>(columnCount);

        if (columnWidth) {
            this._columnWidths.fill(columnWidth);
        } else {
            this._columnWidths = columnWidthsList;
        }

        this.stringsCount = 0;
    }

    public get columnWidths() {
        return this._columnWidths;
    }

    public saveValue(value: any, isHeader: boolean): number {
        let sanitizedValue = '';
        const isDate = value instanceof Date;
        const isSavedAsString = isHeader || (typeof value !== 'number' && value !== Number(value) && !Number.isFinite(value) && !isDate);

        if (isSavedAsString) {
            sanitizedValue = this.sanitizeValue(value);

            if (this._dictionary[sanitizedValue] === undefined) {
                this._dictionary[sanitizedValue] = this._counter++;
                this.dirtyKeyCollections();
            }

            this.stringsCount ++;
        } else if (isDate) {
            this.hasDateValues = true;
        } else {
            this.hasNumberValues = true;
        }

        return isSavedAsString ? this.getSanitizedValue(sanitizedValue) : -1;
    }

    public getValue(value: string): number {
        return this.getSanitizedValue(this.sanitizeValue(value));
    }

    public getSanitizedValue(sanitizedValue: string): number {
        return this._dictionary[sanitizedValue];
    }

    public getKeys(): string[] {
        if (!this._keysAreValid) {
            this._keys = Object.keys(this._dictionary);
            this._keysAreValid = true;
        }

        return this._keys;
    }

    private getTextWidth(value: any): number {
        if (this._widthsDictionary[value] === undefined) {
            const context = this.getContext();
            const metrics = context.measureText(value);
            this._widthsDictionary[value] = metrics.width + WorksheetDataDictionary.TEXT_PADDING;
        }

        return this._widthsDictionary[value];
    }

    private getContext(): any {
        if (!this._context) {
            const canvas = document.createElement('canvas');
            this._context = canvas.getContext('2d');
            this._context.font = WorksheetDataDictionary.DEFAULT_FONT;
        }

        return this._context;
    }

    private sanitizeValue(value: any): string {
        if (ExportUtilities.hasValue(value) === false) {
            return '';
        } else {
            const stringValue = String(value);
            return stringValue.replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&apos;');
        }
    }

    private dirtyKeyCollections(): void {
        this._keysAreValid = false;
    }
}
