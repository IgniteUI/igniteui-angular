export class WorksheetDataDictionary {
    private static DEFAULT_FONT = "11pt Calibri";
    private static TEXT_PADDING = 5;

    private _dictionary: any;
    private _stringWidthDictionary: any;

    private _sortedKeysByValue: string[];
    private _sortedKeysByValueAreValid: boolean;

    private _keys: string[];
    private _keysAreValid: boolean;

    private _counter: number;
    private _calculateColumnWidth: boolean;
    private _columnWidths: number[];
    private _context: any;

    constructor(columnCount: number, columnWidth: number) {
        this._dictionary = {};
        this._stringWidthDictionary = {};
        this._counter = 0;
        this.dirtyKeyCollections();

        this._calculateColumnWidth = !columnWidth;
        this._columnWidths = new Array<number>(columnCount);

        if (!this._calculateColumnWidth) {
            this._columnWidths.fill(columnWidth);
        }
    }

    public get columnWidths() {
        return this._columnWidths;
    }

    public saveValue(value: string, column: number): number {
        const sanitizedValue = this.sanitizeValue(value);

        if (this._dictionary[sanitizedValue] === undefined) {
            this._dictionary[sanitizedValue] = this._counter++;
            this.dirtyKeyCollections();
        }

        if (this._calculateColumnWidth) {
            const width = this.getTextWidth(value);
            const maxWidth = Math.max(this._columnWidths[column] || 0, width);
            this._columnWidths[column] = maxWidth;
        }

        return this.getSanitizedValue(sanitizedValue);
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

    private getTextWidth(text): number {
        if (this._stringWidthDictionary[text] === undefined) {
            const context = this.getContext();
            const metrics = context.measureText(text);
            this._stringWidthDictionary[text] = metrics.width + WorksheetDataDictionary.TEXT_PADDING;
        }

        return this._stringWidthDictionary[text];
    }

    private getContext(): any {
        if (!this._context) {
            const canvas = document.createElement("canvas");
            this._context = canvas.getContext("2d");
            this._context.font = WorksheetDataDictionary.DEFAULT_FONT;
        }

        return this._context;
    }

    private sanitizeValue(value: string): string {
        return value.replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&apos;");
    }

    private dirtyKeyCollections(): void {
        this._keysAreValid = false;
    }
}
