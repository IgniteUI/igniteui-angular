import { ObjectComparer } from "../excel/jszip-verification-wrapper";

export class CSVWrapper {
    private _data: string;
    private _hasValues = true;
    private _delimiter = "";
    private _eor = "\n";

    constructor(data: string, valueDelimiter: string) {
        this._data = data;
        this._delimiter = valueDelimiter;
    }

    public verifyData(expectedData: string, message?: string) {
        expect(this._data).toBe(expectedData, message);
    }

    get noHeadersStringData() {
        return `Column 1
Terrance Orta
Richard Mahoney LongerName
Donna Price
Lisa Landers
Dorothy H. Spencer
`;
    }

    get noHeadersObjectData() {
        return `value
1
2
3
`;
    }

    get noHeadersNumberData() {
        return `Column 1
10
20
30
`;
    }

    get noHeadersDateTimeData() {
        return `Column 1
Mon Jan 01 2018 02:00:00 GMT+0200 (FLE Standard Time)
Mon Apr 23 2018 00:00:00 GMT+0300 (FLE Daylight Time)
Thu Jan 01 1970 02:00:00 GMT+0200 (FLE Standard Time)
Fri Mar 23 2018 00:00:00 GMT+0200 (FLE Standard Time)
`;
    }

    get contactsData() {
        return `name${this._delimiter}phone
Terrance Orta${this._delimiter}770-504-2217
Richard Mahoney LongerName${this._delimiter}
Donna Price${this._delimiter}859-496-2817
${this._delimiter}901-747-3428
Dorothy H. Spencer${this._delimiter}573-394-9254
`;
    }

    get contactsFunkyData() {
        return `name${this._delimiter}phone
Terrance Mc'Orta${this._delimiter}(+359)770-504-2217 | 2218
Richard Mahoney /LongerName/${this._delimiter}
"Donna, /; Price"${this._delimiter}859 496 28**
"\r\n"${this._delimiter}901-747-3428
Dorothy "H." Spencer${this._delimiter}573-394-9254[fax]
"Иван Иванов (1,2)"${this._delimiter}№ 573-394-9254
`;

    }

    get contactsPartialData() {
        return `name${this._delimiter}phone
Terrance Orta${this._delimiter}770-504-2217
Richard Mahoney LongerName${this._delimiter}
${this._delimiter}780-555-1331
`;
    }
}
