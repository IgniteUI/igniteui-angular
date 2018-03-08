export class WorksheetDataDictionary {
    private static MIN_WIDTH = 8;
    private static DEFAULT_FONT = "12pt Calibri";

    private _dictionary: any;
    private _sortedKeys: string[];
    private _sortedKeysIsValid: boolean;
    private _index: number;
    private _calculateColumnWidth: boolean;
    private _columnWidths: number[];
    private _canvas: any;

    constructor(columnCount: number, columnWidth: number) {
        this._dictionary = {};
        this._index = 0;
        this._sortedKeysIsValid = false;

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
        const sanitizedValue = this.santizieValue(value);

        if (this._dictionary[sanitizedValue] === undefined) {
            this._dictionary[sanitizedValue] = this._index++;
            this._sortedKeysIsValid = false;
        }

        if (this._calculateColumnWidth) {
            const width = this.getTextWidth(value);
            const maxWidth = Math.max(this._columnWidths[column] || 0, width);
            this._columnWidths[column] = maxWidth;
        }

        return this.getSanitizedValue(sanitizedValue);
    }

    public getValue(value: string): number {
        return this.getSanitizedValue(this.santizieValue(value));
    }

    public getSortedValues(): string[] {
        if (!this._sortedKeysIsValid) {
            this._sortedKeys = Object.keys(this._dictionary).sort((a, b) => this._dictionary[a] > this._dictionary[b] ? 1 : -1);
            this._sortedKeysIsValid = true;
        }
        return this._sortedKeys;
    }

    public getKeyFromValue(value: number): string {
        return Object.keys(this._dictionary).filter((s) => this._dictionary[s] === value)[0];
    }

    private getTextWidth(text) {
        const canvas = this._canvas || (this._canvas = document.createElement("canvas"));
        const context = canvas.getContext("2d");
        context.font = WorksheetDataDictionary.DEFAULT_FONT;
        const metrics = context.measureText(text);
        return metrics.width;
    }

    private santizieValue(value: string): string {
        return value.replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&apos;");
    }

    private getSanitizedValue(sanitizedValue: string): number {
        return this._dictionary[sanitizedValue];
    }
}
