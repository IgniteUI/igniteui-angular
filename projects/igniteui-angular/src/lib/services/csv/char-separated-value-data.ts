import { ExportUtilities } from '../exporter-common/export-utilities';

/**
 * @hidden
 */
export class CharSeparatedValueData {
    private _headerRecord = '';
    private _dataRecords = '';
    private _eor = '\r\n';
    private _delimiter;
    private _escapeCharacters = ['\r', '\n', '\r\n'];
    private _delimiterLength = 1;
    private _isSpecialData = false;

    constructor(private _data: any[], valueDelimiter: string, private _isTreeGridData = false) {
        this.setDelimiter(valueDelimiter);
    }

    public prepareData() {
        if (!this._data || this._data.length === 0) {
            return '';
        }

        this._data = this._data.map((item) => item.rowData);

        const keys = ExportUtilities.getKeysFromData(this._data);

        if (keys.length === 0) {
            return '';
        }

        this._isSpecialData = ExportUtilities.isSpecialData(this._data);
        this._escapeCharacters.push(this._delimiter);

        this._headerRecord = this.processHeaderRecord(keys, this._escapeCharacters);
        this._dataRecords = this.processDataRecords(this._data, keys, this._escapeCharacters);

        return this._headerRecord + this._dataRecords;
    }

    private processField(value, escapeChars): string {
        let safeValue = ExportUtilities.hasValue(value) ? String(value) : '';
        if (escapeChars.some((v) => safeValue.includes(v))) {
            safeValue = `"${safeValue}"`;
        }
        return safeValue + this._delimiter;
    }

    private processHeaderRecord(keys, escapeChars): string {
        let recordData = '';
        for (const keyName of keys) {
            recordData += this.processField(keyName, this._escapeCharacters);
        }

        return recordData.slice(0, -this._delimiterLength) + this._eor;
    }

    private processRecord(record, keys, escapeChars): string {
        let recordData = '';
        for (const keyName of keys) {

            const value = (record[keyName] !== undefined) ? record[keyName] : this._isSpecialData ? record : '';
            recordData += this.processField(value, this._escapeCharacters);
        }

        return recordData.slice(0, -this._delimiterLength) + this._eor;
    }

    private processDataRecords(currentData, keys, escapeChars) {
        let dataRecords = '';
        for (const row of currentData) {
            dataRecords += this.processRecord(row, keys, escapeChars);
        }

        return dataRecords;
    }

    private setDelimiter(value) {
        this._delimiter = value;
        this._delimiterLength = value.length;
    }
}
