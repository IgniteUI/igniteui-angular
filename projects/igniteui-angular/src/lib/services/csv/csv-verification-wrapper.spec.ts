
export class CSVWrapper {
    private _data: string;
    private _hasValues = true;
    private _delimiter = '';
    private _eor = '\r\n';

    constructor(data: string, valueDelimiter: string) {
        this._data = data;
        this._delimiter = valueDelimiter;
    }

    public verifyData(expectedData: string, message?: string) {
        expect(this._data).toBe(expectedData, message);
    }

    public get noHeadersStringData() {
        return `Column 1${this._eor}` +
`Terrance Orta${this._eor}` +
`Richard Mahoney LongerName${this._eor}` +
`Donna Price${this._eor}` +
`Lisa Landers${this._eor}` +
`Dorothy H. Spencer${this._eor}`;
    }

    public get noHeadersObjectData() {
        return `value${this._eor}` +
`1${this._eor}` +
`2${this._eor}` +
`3${this._eor}`;
    }

    public get noHeadersNumberData() {
        return `Column 1${this._eor}` +
`10${this._eor}` +
`20${this._eor}` +
`30${this._eor}`;
    }

    public get noHeadersDateTimeData() {
        return `Column 1${this._eor}` +
`${new Date('2018').toString()}${this._eor}` +
`${new Date(2018, 3, 23).toString()}${this._eor}` +
`${new Date(30).toString()}${this._eor}` +
`${new Date('2018/03/23').toString()}${this._eor}`;
    }

    public get contactsData() {
        return `name${this._delimiter}phone${this._eor}Terrance Orta${this._delimiter}770-504-2217${this._eor}` +
                `Richard Mahoney LongerName${this._delimiter}${this._eor}Donna Price${this._delimiter}859-496-2817${this._eor}` +
                `${this._delimiter}901-747-3428${this._eor}Dorothy H. Spencer${this._delimiter}573-394-9254${this._eor}`;
    }

    public get contactsFunkyData() {
        return `name${this._delimiter}phone${this._eor}Terrance Mc'Orta${this._delimiter}(+359)770-504-2217 | 2218${this._eor}` +
                `Richard Mahoney /LongerName/${this._delimiter}${this._eor}"Donna${this._delimiter} /; Price"${this._delimiter}` +
                `859 496 28**${this._eor}"\r\n"${this._delimiter}901-747-3428${this._eor}Dorothy "H." Spencer${this._delimiter}` +
                `573-394-9254[fax]${this._eor}"Иван Иванов (1${this._delimiter}2)"${this._delimiter}№ 573-394-9254${this._eor}`;

    }

    public get contactsPartialData() {
        return `name${this._delimiter}phone${this._eor}Terrance Orta${this._delimiter}770-504-2217${this._eor}` +
                `Richard Mahoney LongerName${this._delimiter}${this._eor}${this._delimiter}780-555-1331${this._eor}`;
    }

    public get simpleGridData() {
        return `ID${this._delimiter}Name${this._delimiter}JobTitle${this._eor}` +
        `1${this._delimiter}Casey Houston${this._delimiter}Vice President${this._eor}` +
        `2${this._delimiter}Gilberto Todd${this._delimiter}Director${this._eor}` +
        `3${this._delimiter}Tanya Bennett${this._delimiter}Director${this._eor}` +
        `4${this._delimiter}Jack Simon${this._delimiter}Software Developer${this._eor}` +
        `5${this._delimiter}Celia Martinez${this._delimiter}Senior Software Developer${this._eor}` +
        `6${this._delimiter}Erma Walsh${this._delimiter}CEO${this._eor}` +
        `7${this._delimiter}Debra Morton${this._delimiter}Associate Software Developer${this._eor}` +
        `8${this._delimiter}Erika Wells${this._delimiter}Software Development Team Lead${this._eor}` +
        `9${this._delimiter}Leslie Hansen${this._delimiter}Associate Software Developer${this._eor}` +
        `10${this._delimiter}Eduardo Ramirez${this._delimiter}Manager${this._eor}`;
    }

    public get simpleGridDataFormatted() {
        return `ID${this._delimiter}Name${this._delimiter}JobTitle${this._eor}` +
        `1${this._delimiter}CASEY HOUSTON${this._delimiter}vice president${this._eor}` +
        `2${this._delimiter}GILBERTO TODD${this._delimiter}director${this._eor}` +
        `3${this._delimiter}TANYA BENNETT${this._delimiter}director${this._eor}` +
        `4${this._delimiter}JACK SIMON${this._delimiter}software developer${this._eor}` +
        `5${this._delimiter}CELIA MARTINEZ${this._delimiter}senior software developer${this._eor}` +
        `6${this._delimiter}ERMA WALSH${this._delimiter}ceo${this._eor}` +
        `7${this._delimiter}DEBRA MORTON${this._delimiter}associate software developer${this._eor}` +
        `8${this._delimiter}ERIKA WELLS${this._delimiter}software development team lead${this._eor}` +
        `9${this._delimiter}LESLIE HANSEN${this._delimiter}associate software developer${this._eor}` +
        `10${this._delimiter}EDUARDO RAMIREZ${this._delimiter}manager${this._eor}`;
    }

    public get sortedSimpleGridData() {
        return `ID${this._delimiter}Name${this._delimiter}JobTitle${this._eor}` +
        `1${this._delimiter}Casey Houston${this._delimiter}Vice President${this._eor}` +
        `5${this._delimiter}Celia Martinez${this._delimiter}Senior Software Developer${this._eor}` +
        `7${this._delimiter}Debra Morton${this._delimiter}Associate Software Developer${this._eor}` +
        `10${this._delimiter}Eduardo Ramirez${this._delimiter}Manager${this._eor}` +
        `8${this._delimiter}Erika Wells${this._delimiter}Software Development Team Lead${this._eor}` +
        `6${this._delimiter}Erma Walsh${this._delimiter}CEO${this._eor}` +
        `2${this._delimiter}Gilberto Todd${this._delimiter}Director${this._eor}` +
        `4${this._delimiter}Jack Simon${this._delimiter}Software Developer${this._eor}` +
        `9${this._delimiter}Leslie Hansen${this._delimiter}Associate Software Developer${this._eor}` +
        `3${this._delimiter}Tanya Bennett${this._delimiter}Director${this._eor}`;
    }

    public get sortedDescSimpleGridData() {
        return `ID${this._delimiter}Name${this._delimiter}JobTitle${this._eor}` +
        `3${this._delimiter}Tanya Bennett${this._delimiter}Director${this._eor}` +
        `9${this._delimiter}Leslie Hansen${this._delimiter}Associate Software Developer${this._eor}` +
        `4${this._delimiter}Jack Simon${this._delimiter}Software Developer${this._eor}` +
        `2${this._delimiter}Gilberto Todd${this._delimiter}Director${this._eor}` +
        `6${this._delimiter}Erma Walsh${this._delimiter}CEO${this._eor}` +
        `8${this._delimiter}Erika Wells${this._delimiter}Software Development Team Lead${this._eor}` +
        `10${this._delimiter}Eduardo Ramirez${this._delimiter}Manager${this._eor}` +
        `7${this._delimiter}Debra Morton${this._delimiter}Associate Software Developer${this._eor}` +
        `5${this._delimiter}Celia Martinez${this._delimiter}Senior Software Developer${this._eor}` +
        `1${this._delimiter}Casey Houston${this._delimiter}Vice President${this._eor}`;
    }

    public get simpleGridRawData() {
        return `ID${this._delimiter}Name${this._delimiter}JobTitle${this._delimiter}${this._eor}` +
        `1${this._delimiter}Casey Houston${this._delimiter}Vice President${this._delimiter}${this._eor}` +
        `2${this._delimiter}Gilberto Todd${this._delimiter}Director${this._delimiter}${this._eor}` +
        `3${this._delimiter}Tanya Bennett${this._delimiter}Director${this._delimiter}${this._eor}` +
        `4${this._delimiter}Jack Simon${this._delimiter}Software Developer${this._delimiter}${this._eor}` +
        `5${this._delimiter}Celia Martinez${this._delimiter}Senior Software Developer${this._delimiter}${this._eor}` +
        `6${this._delimiter}Erma Walsh${this._delimiter}CEO${this._delimiter}${this._eor}` +
        `7${this._delimiter}Debra Morton${this._delimiter}Associate Software Developer${this._delimiter}${this._eor}` +
        `8${this._delimiter}Erika Wells${this._delimiter}Software Development Team Lead${this._delimiter}${this._eor}` +
        `9${this._delimiter}Leslie Hansen${this._delimiter}Associate Software Developer${this._delimiter}${this._eor}` +
        `10${this._delimiter}Eduardo Ramirez${this._delimiter}Manager${this._delimiter}${this._eor}`;
    }

    public get gridOneSeniorDev() {
        return `ID${this._delimiter}Name${this._delimiter}JobTitle${this._eor}` +
        `5${this._delimiter}Celia Martinez${this._delimiter}Senior Software Developer${this._eor}`;
    }

    public get gridTwoDirectors() {
        return `ID${this._delimiter}Name${this._delimiter}JobTitle${this._eor}` +
        `2${this._delimiter}Gilberto Todd${this._delimiter}Director${this._eor}` +
        `3${this._delimiter}Tanya Bennett${this._delimiter}Director${this._eor}`;
    }

    public get gridNameJobTitle() {
        return `Name${this._delimiter}JobTitle${this._eor}` +
        `Casey Houston${this._delimiter}Vice President${this._eor}` +
        `Gilberto Todd${this._delimiter}Director${this._eor}` +
        `Tanya Bennett${this._delimiter}Director${this._eor}` +
        `Jack Simon${this._delimiter}Software Developer${this._eor}` +
        `Celia Martinez${this._delimiter}Senior Software Developer${this._eor}` +
        `Erma Walsh${this._delimiter}CEO${this._eor}` +
        `Debra Morton${this._delimiter}Associate Software Developer${this._eor}` +
        `Erika Wells${this._delimiter}Software Development Team Lead${this._eor}` +
        `Leslie Hansen${this._delimiter}Associate Software Developer${this._eor}` +
        `Eduardo Ramirez${this._delimiter}Manager${this._eor}`;
    }

    public get gridNameJobTitleID() {
        return `Name${this._delimiter}JobTitle${this._delimiter}ID${this._eor}` +
        `Casey Houston${this._delimiter}Vice President${this._delimiter}1${this._eor}` +
        `Gilberto Todd${this._delimiter}Director${this._delimiter}2${this._eor}` +
        `Tanya Bennett${this._delimiter}Director${this._delimiter}3${this._eor}` +
        `Jack Simon${this._delimiter}Software Developer${this._delimiter}4${this._eor}` +
        `Celia Martinez${this._delimiter}Senior Software Developer${this._delimiter}5${this._eor}` +
        `Erma Walsh${this._delimiter}CEO${this._delimiter}6${this._eor}` +
        `Debra Morton${this._delimiter}Associate Software Developer${this._delimiter}7${this._eor}` +
        `Erika Wells${this._delimiter}Software Development Team Lead${this._delimiter}8${this._eor}` +
        `Leslie Hansen${this._delimiter}Associate Software Developer${this._delimiter}9${this._eor}` +
        `Eduardo Ramirez${this._delimiter}Manager${this._delimiter}10${this._eor}`;
    }

    public get gridNameIDJobTitle() {
        return `Name${this._delimiter}ID${this._delimiter}JobTitle${this._eor}` +
        `Casey Houston${this._delimiter}1${this._delimiter}Vice President${this._eor}` +
        `Gilberto Todd${this._delimiter}2${this._delimiter}Director${this._eor}` +
        `Tanya Bennett${this._delimiter}3${this._delimiter}Director${this._eor}` +
        `Jack Simon${this._delimiter}4${this._delimiter}Software Developer${this._eor}` +
        `Celia Martinez${this._delimiter}5${this._delimiter}Senior Software Developer${this._eor}` +
        `Erma Walsh${this._delimiter}6${this._delimiter}CEO${this._eor}` +
        `Debra Morton${this._delimiter}7${this._delimiter}Associate Software Developer${this._eor}` +
        `Erika Wells${this._delimiter}8${this._delimiter}Software Development Team Lead${this._eor}` +
        `Leslie Hansen${this._delimiter}9${this._delimiter}Associate Software Developer${this._eor}` +
        `Eduardo Ramirez${this._delimiter}10${this._delimiter}Manager${this._eor}`;
    }

    public get gridWithAdvancedFilters() {
        return `ID${this._delimiter}Name${this._delimiter}JobTitle${this._eor}` +
        `6${this._delimiter}Erma Walsh${this._delimiter}CEO${this._eor}` +
        `7${this._delimiter}Debra Morton${this._delimiter}Associate Software Developer${this._eor}` +
        `8${this._delimiter}Erika Wells${this._delimiter}Software Development Team Lead${this._eor}` +
        `10${this._delimiter}Eduardo Ramirez${this._delimiter}Manager${this._eor}`;
    }

    public get treeGridData() {
        return `ID${this._delimiter}ParentID${this._delimiter}Name${this._delimiter}JobTitle${this._delimiter}Age${this._eor}` +
`1${this._delimiter}-1${this._delimiter}Casey Houston${this._delimiter}Vice President${this._delimiter}32${this._eor}` +
`2${this._delimiter}1${this._delimiter}Gilberto Todd${this._delimiter}Director${this._delimiter}41${this._eor}` +
`3${this._delimiter}2${this._delimiter}Tanya Bennett${this._delimiter}Director${this._delimiter}29${this._eor}` +
`7${this._delimiter}2${this._delimiter}Debra Morton${this._delimiter}Associate Software Developer${this._delimiter}35${this._eor}` +
`4${this._delimiter}1${this._delimiter}Jack Simon${this._delimiter}Software Developer${this._delimiter}33${this._eor}` +
`6${this._delimiter}-1${this._delimiter}Erma Walsh${this._delimiter}CEO${this._delimiter}52${this._eor}` +
`10${this._delimiter}-1${this._delimiter}Eduardo Ramirez${this._delimiter}Manager${this._delimiter}53${this._eor}` +
`9${this._delimiter}10${this._delimiter}Leslie Hansen${this._delimiter}Associate Software Developer${this._delimiter}44${this._eor}`;
    }

    public get treeGridDataFormatted() {
        return `ID${this._delimiter}ParentID${this._delimiter}Name${this._delimiter}JobTitle${this._delimiter}Age${this._eor}` +
`1${this._delimiter}-1${this._delimiter}Casey Houston${this._delimiter}vice president${this._delimiter}384${this._eor}` +
`2${this._delimiter}1${this._delimiter}Gilberto Todd${this._delimiter}director${this._delimiter}492${this._eor}` +
`3${this._delimiter}2${this._delimiter}Tanya Bennett${this._delimiter}director${this._delimiter}348${this._eor}` +
`7${this._delimiter}2${this._delimiter}Debra Morton${this._delimiter}associate software developer${this._delimiter}420${this._eor}` +
`4${this._delimiter}1${this._delimiter}Jack Simon${this._delimiter}software developer${this._delimiter}396${this._eor}` +
`6${this._delimiter}-1${this._delimiter}Erma Walsh${this._delimiter}ceo${this._delimiter}624${this._eor}` +
`10${this._delimiter}-1${this._delimiter}Eduardo Ramirez${this._delimiter}manager${this._delimiter}636${this._eor}` +
`9${this._delimiter}10${this._delimiter}Leslie Hansen${this._delimiter}associate software developer${this._delimiter}528${this._eor}`;
    }

    public get treeGridDataSorted() {
        return `ID${this._delimiter}ParentID${this._delimiter}Name${this._delimiter}JobTitle${this._delimiter}Age${this._eor}` +
`10${this._delimiter}-1${this._delimiter}Eduardo Ramirez${this._delimiter}Manager${this._delimiter}53${this._eor}` +
`9${this._delimiter}10${this._delimiter}Leslie Hansen${this._delimiter}Associate Software Developer${this._delimiter}44${this._eor}` +
`6${this._delimiter}-1${this._delimiter}Erma Walsh${this._delimiter}CEO${this._delimiter}52${this._eor}` +
`1${this._delimiter}-1${this._delimiter}Casey Houston${this._delimiter}Vice President${this._delimiter}32${this._eor}` +
`4${this._delimiter}1${this._delimiter}Jack Simon${this._delimiter}Software Developer${this._delimiter}33${this._eor}` +
`2${this._delimiter}1${this._delimiter}Gilberto Todd${this._delimiter}Director${this._delimiter}41${this._eor}` +
`7${this._delimiter}2${this._delimiter}Debra Morton${this._delimiter}Associate Software Developer${this._delimiter}35${this._eor}` +
`3${this._delimiter}2${this._delimiter}Tanya Bennett${this._delimiter}Director${this._delimiter}29${this._eor}`;
    }

    public get treeGridDataFiltered() {
        return `ID${this._delimiter}ParentID${this._delimiter}Name${this._delimiter}JobTitle${this._delimiter}Age${this._eor}` +
`1${this._delimiter}-1${this._delimiter}Casey Houston${this._delimiter}Vice President${this._delimiter}32${this._eor}` +
`2${this._delimiter}1${this._delimiter}Gilberto Todd${this._delimiter}Director${this._delimiter}41${this._eor}` +
`7${this._delimiter}2${this._delimiter}Debra Morton${this._delimiter}Associate Software Developer${this._delimiter}35${this._eor}` +
`4${this._delimiter}1${this._delimiter}Jack Simon${this._delimiter}Software Developer${this._delimiter}33${this._eor}` +
`6${this._delimiter}-1${this._delimiter}Erma Walsh${this._delimiter}CEO${this._delimiter}52${this._eor}` +
`10${this._delimiter}-1${this._delimiter}Eduardo Ramirez${this._delimiter}Manager${this._delimiter}53${this._eor}` +
`9${this._delimiter}10${this._delimiter}Leslie Hansen${this._delimiter}Associate Software Developer${this._delimiter}44${this._eor}`;
    }

    public get treeGridDataFilterSorted() {
        return `ID${this._delimiter}ParentID${this._delimiter}Name${this._delimiter}JobTitle${this._delimiter}Age${this._eor}` +
`6${this._delimiter}-1${this._delimiter}Erma Walsh${this._delimiter}CEO${this._delimiter}52${this._eor}` +
`10${this._delimiter}-1${this._delimiter}Eduardo Ramirez${this._delimiter}Manager${this._delimiter}53${this._eor}` +
`9${this._delimiter}10${this._delimiter}Leslie Hansen${this._delimiter}Associate Software Developer${this._delimiter}44${this._eor}` +
`1${this._delimiter}-1${this._delimiter}Casey Houston${this._delimiter}Vice President${this._delimiter}32${this._eor}` +
`4${this._delimiter}1${this._delimiter}Jack Simon${this._delimiter}Software Developer${this._delimiter}33${this._eor}` +
`2${this._delimiter}1${this._delimiter}Gilberto Todd${this._delimiter}Director${this._delimiter}41${this._eor}` +
`7${this._delimiter}2${this._delimiter}Debra Morton${this._delimiter}Associate Software Developer${this._delimiter}35${this._eor}`;
    }

    public get treeGridWithAdvancedFilters() {
        return `ID${this._delimiter}ParentID${this._delimiter}Name${this._delimiter}JobTitle${this._delimiter}Age${this._eor}` +
        `1${this._delimiter}-1${this._delimiter}Casey Houston${this._delimiter}Vice President${this._delimiter}32${this._eor}` +
        `2${this._delimiter}1${this._delimiter}Gilberto Todd${this._delimiter}Director${this._delimiter}41${this._eor}` +
        `7${this._delimiter}2${this._delimiter}Debra Morton${this._delimiter}Associate Software Developer${this._delimiter}35${this._eor}` +
        `6${this._delimiter}-1${this._delimiter}Erma Walsh${this._delimiter}CEO${this._delimiter}52${this._eor}` +
        `10${this._delimiter}-1${this._delimiter}Eduardo Ramirez${this._delimiter}Manager${this._delimiter}53${this._eor}`;
    }
}
