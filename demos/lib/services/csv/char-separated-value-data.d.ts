export declare class CharSeparatedValueData {
    private _data;
    private _headerRecord;
    private _dataRecords;
    private _eor;
    private _delimiter;
    private _escapeCharacters;
    private _delimiterLength;
    private _isSpecialData;
    constructor(_data: any[], valueDelimiter: string);
    prepareData(): string;
    private processField(value, escapeChars);
    private processHeaderRecord(keys, escapeChars);
    private processRecord(record, keys, escapeChars);
    private processDataRecords(currentData, keys, escapeChars);
    private setDelimiter(value);
}
