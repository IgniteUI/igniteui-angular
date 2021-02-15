import { ExportUtilities } from '../exporter-common/export-utilities';
import { yieldingLoop } from '../../core/utils';

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

    constructor(private _data: any[], valueDelimiter: string)  {
        this.setDelimiter(valueDelimiter);
    }

    public prepareData() {
        if (!this._data || this._data.length === 0) {
            return '';
        }

        const keys = ExportUtilities.getKeysFromData(this._data);

        if (keys.length === 0) {
            return '';
        }

        this._isSpecialData = ExportUtilities.isSpecialData(this._data);
        this._escapeCharacters.push(this._delimiter);

        this._headerRecord = this.processHeaderRecord(keys);
        this._dataRecords = this.processDataRecords(this._data, keys);

        return this._headerRecord + this._dataRecords;
    }

    public prepareDataAsync(done: (result: string) => void) {
        if (!this._data || this._data.length === 0) {
            done('');
        }

        const keys = ExportUtilities.getKeysFromData(this._data);

        if (keys.length === 0) {
            done('');
        }

        this._isSpecialData = ExportUtilities.isSpecialData(this._data);
        this._escapeCharacters.push(this._delimiter);

        this._headerRecord = this.processHeaderRecord(keys);
        this.processDataRecordsAsync(this._data, keys, (dr) => {
            done(this._headerRecord + dr);
        });
    }

    private processField(value, escapeChars): string {
        let safeValue = ExportUtilities.hasValue(value) ? String(value) : '';
        if (escapeChars.some((v) => safeValue.includes(v))) {
            safeValue = `"${safeValue}"`;
        }
        return safeValue + this._delimiter;
    }

    private processHeaderRecord(keys): string {
        let recordData = '';
        for (const keyName of keys) {
            recordData += this.processField(keyName, this._escapeCharacters);
        }

        return recordData.slice(0, -this._delimiterLength) + this._eor;
    }

    private processRecord(record, keys): string {
        const recordData = new Array(keys.length);
        for (let index = 0; index < keys.length; index++) {
            const value = (record[keys[index]] !== undefined) ? record[keys[index]] : this._isSpecialData ? record : '';
            recordData[index] = this.processField(value, this._escapeCharacters);
        }

        return recordData.join('').slice(0, -this._delimiterLength) + this._eor;
    }

    private processDataRecords(currentData, keys) {
        const dataRecords = new Array(currentData.length);

        for (let i = 0; i < currentData.length; i++) {
            const row = currentData[i];
            dataRecords[i] = this.processRecord(row, keys);
        }

        return dataRecords.join('');
    }

    private processDataRecordsAsync(currentData, keys, done: (result: string) => void) {
        const dataRecords = new Array(currentData.length);

        yieldingLoop(currentData.length, 1000,
            (i) => {
                const row = currentData[i];
                dataRecords[i] = this.processRecord(row, keys);
            },
            () => {
                done(dataRecords.join(''));
            });
    }

    private setDelimiter(value) {
        this._delimiter = value;
        this._delimiterLength = value.length;
    }
}
