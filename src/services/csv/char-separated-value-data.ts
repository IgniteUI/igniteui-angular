import { ExportUtilities } from "../exporter-common/export-utilities";

export class CharSeparatedValueData {
    private _headerRecord = "";
    private _dataRecords = "";
    private _eof = 0x1A;
    private _eor = "\n";
    private _values;
    private _delimiter = ",";
    private _escapeCharacters = ["\r", "\n", "\r\n"];
    private _delimiterLength = 1;
    private _defaultColumnHeader = "Column 1";

    constructor(private _data: any[], valueDelimiter: string) {
        this.prepareData();
        this._delimiter = valueDelimiter;
        this._delimiterLength = valueDelimiter.length;
    }

    public get data() {
        return this._data;
    }

    public set data(value: any[]) {
        this._data = value;

        this.prepareData();
    }

    public prepareData() {
        if (!this._data || this._data.length === 0) {
            return "";
        }

        const dataEntry = this._data[0];
        const exportStringData = typeof dataEntry === "string";

        const keys = exportStringData ? [this._defaultColumnHeader] : ExportUtilities.getKeysFromData(this._data);

        if (keys.length === 0) {
            return "";
        }

        this._escapeCharacters.push(this._delimiter);

        this._headerRecord = this.processHeaderRecord(keys, this._escapeCharacters);
        this._dataRecords = this.processDataRecords(this._data, keys, this._escapeCharacters);

        return this._headerRecord + this._dataRecords;
    }

    private processField(value, escapeChars): string {
        let safeValue: string = (value !== undefined && value !== null) ? String(value) : "";
        if (escapeChars.some((v) => safeValue.includes(v))) {
            safeValue = `"${safeValue}"`;
        }
        return safeValue + this._delimiter;
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
            const value = (record[keyName] !== undefined) ? record[keyName] : (typeof record === "string") ? record : "";
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
