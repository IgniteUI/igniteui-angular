import { ObjectComparer } from "../excel/jszip-verification-wrapper";

export class CSVWrapper {
    private _data: string;
    private _hasValues = true;
    private _delimiter = "";
    private _eor = "\r\n";

    constructor(data: string, valueDelimiter: string) {
        this._data = data;
        this._delimiter = valueDelimiter;
    }

    public verifyData(expectedData: string, message?: string) {
        expect(this._data).toBe(expectedData, message);
    }

    get noHeadersStringData() {
        return `Column 1${this._eor}` +
`Terrance Orta${this._eor}` +
`Richard Mahoney LongerName${this._eor}` +
`Donna Price${this._eor}` +
`Lisa Landers${this._eor}` +
`Dorothy H. Spencer${this._eor}`;
    }

    get noHeadersObjectData() {
        return `value${this._eor}` +
`1${this._eor}` +
`2${this._eor}` +
`3${this._eor}`;
    }

    get noHeadersNumberData() {
        return `Column 1${this._eor}` +
`10${this._eor}` +
`20${this._eor}` +
`30${this._eor}`;
    }

    get noHeadersDateTimeData() {
        return `Column 1${this._eor}` +
`Mon Jan 01 2018 02:00:00 GMT+0200 (FLE Standard Time)${this._eor}` +
`Mon Apr 23 2018 00:00:00 GMT+0300 (FLE Daylight Time)${this._eor}` +
`Thu Jan 01 1970 02:00:00 GMT+0200 (FLE Standard Time)${this._eor}` +
`Fri Mar 23 2018 00:00:00 GMT+0200 (FLE Standard Time)${this._eor}`;
    }

    get contactsData() {
        return `name${this._delimiter}phone${this._eor}Terrance Orta${this._delimiter}770-504-2217${this._eor}` +
                `Richard Mahoney LongerName${this._delimiter}${this._eor}Donna Price${this._delimiter}859-496-2817${this._eor}` +
                `${this._delimiter}901-747-3428${this._eor}Dorothy H. Spencer${this._delimiter}573-394-9254${this._eor}`;
    }

    get contactsFunkyData() {
        return `name${this._delimiter}phone${this._eor}Terrance Mc'Orta${this._delimiter}(+359)770-504-2217 | 2218${this._eor}` +
                `Richard Mahoney /LongerName/${this._delimiter}${this._eor}"Donna, /; Price"${this._delimiter}859 496 28**${this._eor}` +
                `"\r\n"${this._delimiter}901-747-3428${this._eor}Dorothy "H." Spencer${this._delimiter}573-394-9254[fax]${this._eor}` +
                `"Иван Иванов (1,2)"${this._delimiter}№ 573-394-9254${this._eor}`;

    }

    get contactsPartialData() {
        return `name${this._delimiter}phone${this._eor}Terrance Orta${this._delimiter}770-504-2217${this._eor}` +
                `Richard Mahoney LongerName${this._delimiter}${this._eor}${this._delimiter}780-555-1331${this._eor}`;
    }
}
