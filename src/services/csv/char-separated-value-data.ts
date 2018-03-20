import { ExportUtilities } from "../exporter-common/export-utilities";

export class CharSeparatedValueData {
    private _headerRecord = "";
    private _dataRecords = "";
    private _eof = 0x1A;
    private _eor = "\r\n";
    private _data: any[];
    private _values;
    private _delimiter = "\t";
    private _escapeCharacters = ["\r", "\n", "\r\n"];
    private _delimiterLength = 1;
    private _defaultColumnHeader = "Column1";

    constructor(data: any[], valueDelimiter: string) {
        this._data = data;
        this._delimiter = valueDelimiter;
        this._delimiterLength = this._delimiter.length;
    }

    public prepareData(): string {
        if (!this._data || this._data.length === 0) {
            return;
        }

        const dataEntry = this._data[0];

        if (typeof dataEntry === "string") {
            this.prepareStringData();
            return;
        }

        const keysFull = ExportUtilities.getKeysFromData(this._data);

        this._escapeCharacters.push(this._delimiter);

        this._headerRecord = this.processHeaderRecord(keysFull, this._escapeCharacters);
        this._dataRecords = this.processDataRecords(this._data, keysFull, this._escapeCharacters);

        return this._headerRecord + this._dataRecords;
    }

    private processField(value, escapeChars): string {
        let safeValue: string = (value !== undefined) ? value : "";
        if (escapeChars.some((v) => safeValue.includes(v))) {
            safeValue = `"${safeValue}"`;
        }
        return safeValue + this._delimiter;
    }

    private prepareStringData(): string {
        this._escapeCharacters.push(this._delimiter);

        this._headerRecord += this._defaultColumnHeader + this._eor;
        for (const row of this._data) {
            this._dataRecords += this.processField(row, this._escapeCharacters)
                                                    .slice(0, -this._delimiterLength) + this._eor;
        }

        return this._headerRecord + this._dataRecords;
    }

    private processHeaderRecord(keys, escapeChars): string {
        let recordData = "";
        for (const keyName of keys) {
            recordData += this.processField(keyName, this._escapeCharacters);
        }

        return recordData.slice(0, -this._delimiterLength) + this._eor;
    }

    private processRecord(record, keys, escapeChars): string {
        let recordData = "";
        for (const keyName of keys) {
            const value = (record[keyName] !== undefined) ? record[keyName] : "";
            recordData += this.processField(value, this._escapeCharacters);
        }

        return recordData.slice(0, -this._delimiterLength) + this._eor;
    }

    private processDataRecords(data, keys, escapeChars) {
        let dataRecords = "";
        for (const row of data) {
            dataRecords += this.processRecord(row, keys, escapeChars);
        }

        return dataRecords;
    }
}
