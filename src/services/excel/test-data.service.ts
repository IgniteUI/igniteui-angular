import { Injectable } from '@angular/core';
import { JSZipFiles } from './jszip-helper';
import { IFileContent } from './jszip-verification-wrapper';
@Injectable()

export class ExportTestDataService {

    private _differentTypesData = [
        { Number: 1, String: "1", Boolean: true, Date: new Date(2018, 3, 3) },
        { Number: 2, String: "2", Boolean: false, Date: new Date(2018, 5, 6) },
        { Number: 3, String: "3", Boolean: true, Date: new Date(2018, 9, 22) }
    ];

    private _contactsData = [{
        name: "Terrance Orta",
        phone: "770-504-2217"
    }, {
        name: "Richard Mahoney LongerName",
        phone: ""
    }, {
        name: "Donna Price",
        phone: "859-496-2817"
    }, {
        name: "",
        phone: "901-747-3428"
    }, {
        name: "Dorothy H. Spencer",
        phone: "573-394-9254"
    }];

    private _contactsPartial = [
        {
            name: "Terrance Orta",
            phone: "770-504-2217"
        }, {
            name: "Richard Mahoney LongerName",
        }, {
            phone: "780-555-1331",
        }
    ];

    private _noHeadersStringData = [
        "Terrance Orta",
        "Richard Mahoney LongerName",
        "Donna Price",
        "Lisa Landers",
        "Dorothy H. Spencer"
        ];

    private _noHeadersObjectData = [
        new ValueData("1"),
        new ValueData("2"),
        new ValueData("3")
    ];

    private _emptyObjectData = [
        {},
        {},
        {}
    ];

    private _simpleGridData = [
        { ID: 1, Name: "Casey Houston", JobTitle: "Vice President", HireDate: "2017-06-19T11:43:07.714Z" },
        { ID: 2, Name: "Gilberto Todd", JobTitle: "Director", HireDate: "2015-12-18T11:23:17.714Z" },
        { ID: 3, Name: "Tanya Bennett", JobTitle: "Director", HireDate: "2005-11-18T11:23:17.714Z" },
        { ID: 4, Name: "Jack Simon", JobTitle: "Software Developer", HireDate: "2008-12-18T11:23:17.714Z" },
        { ID: 5, Name: "Celia Martinez", JobTitle: "Senior Software Developer", HireDate: "2007-12-19T11:23:17.714Z" },
        { ID: 6, Name: "Erma Walsh", JobTitle: "CEO", HireDate: "2016-12-18T11:23:17.714Z" },
        { ID: 7, Name: "Debra Morton", JobTitle: "Associate Software Developer", HireDate: "2005-11-19T11:23:17.714Z" },
        // tslint:disable-next-line:object-literal-sort-keys
        { ID: 8, Name: "Erika Wells", JobTitle: "Software Development Team Lead", HireDate: "2005-10-14T11:23:17.714Z" },
        // tslint:disable-next-line:object-literal-sort-keys
        { ID: 9, Name: "Leslie Hansen", JobTitle: "Associate Software Developer", HireDate: "2013-10-10T11:23:17.714Z" },
        { ID: 10, Name: "Eduardo Ramirez", JobTitle: "Manager", HireDate: "2011-11-28T11:23:17.714Z" }
    ];

    constructor() { }

    get differentTypesData() {
        return this._differentTypesData;
    }

    get contactsData() {
        return this._contactsData;
    }
    get contactsPartialData() {
        return this._contactsPartial;
    }
    get emptyObjectData() {
        return this._emptyObjectData;
    }

    get noHeadersObjectData() {
        return this._noHeadersObjectData;
    }

    get noHeadersStringData() {
        return this._noHeadersStringData;
    }

    get simpleGridData() {
        return this._simpleGridData;
    }
}

export class ValueData {
    public value : string;

    constructor(value : string) {
        this.value = value;
    }
}

export class FileContentData {

    private _fileContentCollection : IFileContent[];
    private _sharedStringsData = "";
    private _tableData = "";
    private _worksheetData = "";

    constructor () {}

    public create(worksheetData : string, tableData : string, sharedStringsData : string) : IFileContent[] {
        this._fileContentCollection = [
            {  fileName: JSZipFiles.DataFiles[1].name, fileContent : worksheetData},
            {  fileName: JSZipFiles.DataFiles[2].name, fileContent : tableData},
            {  fileName: JSZipFiles.DataFiles[3].name, fileContent : sharedStringsData},
        ];
        return this._fileContentCollection;
    }

    private createData() {
        return this.create(this._worksheetData, this._tableData, this._sharedStringsData)
    }

    get differentTypesDataContent() {
        this._sharedStringsData = `count="6" uniqueCount="6"><si><t>Column1</t></si><si><t>Terrance Orta</t></si><si><t>Richard Mahoney LongerName</t></si><si><t>Donna Price</t></si><si><t>Lisa Landers</t></si><si><t>Dorothy H. Spencer</t></si>`;
        this._tableData = `ref="A1:A6" totalsRowShown="0"><autoFilter ref="A1:A6"/><tableColumns count="1"><tableColumn id="1" name="Column1"/></tableColumns>`;
        this._worksheetData = `<dimension ref="A1:A6"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="30.169921875" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c></row><row r="2"><c r="A2" t="s"><v>1</v></c></row><row r="3"><c r="A3" t="s"><v>2</v></c></row><row r="4"><c r="A4" t="s"><v>3</v></c></row><row r="5"><c r="A5" t="s"><v>4</v></c></row><row r="6"><c r="A6" t="s"><v>5</v></c></row></sheetData>`;

        return this.createData();
    }

    get contactsDataContent() {
        this._sharedStringsData = `count="12" uniqueCount="11"><si><t>name</t></si><si><t>phone</t></si><si><t>Terrance Orta</t></si><si>` +
                                `<t>770-504-2217</t></si><si><t>Richard Mahoney LongerName</t></si><si><t></t></si><si><t>Donna Price</t></si>` +
                                `<si><t>859-496-2817</t></si><si><t>901-747-3428</t></si><si><t>Dorothy H. Spencer</t></si><si><t>573-394-9254</t></si>`;

        this._tableData = `ref="A1:B6" totalsRowShown="0">
        <autoFilter ref="A1:B6"/><tableColumns count="2"><tableColumn id="1" name="name"/><tableColumn id="2" name="phone"/></tableColumns>`;

        this._worksheetData = `<dimension ref="A1:B6"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>` +
                            `<sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="30.169921875" ` +
                            `customWidth="1"/><col min="2" max="2" width="13.633593750000001" customWidth="1"/></cols><sheetData><row r="1">` +
                            `<c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row><row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2" t="s">` +
                            `<v>3</v></c></row><row r="3"><c r="A3" t="s"><v>4</v></c><c r="B3" t="s"><v>5</v></c></row><row r="4"><c r="A4" t="s">` +
                            `<v>6</v></c><c r="B4" t="s"><v>7</v></c></row><row r="5"><c r="A5" t="s"><v>5</v></c><c r="B5" t="s"><v>8</v></c></row>` +
                            `<row r="6"><c r="A6" t="s"><v>9</v></c><c r="B6" t="s"><v>10</v></c></row></sheetData>`;

        return this.createData();
    }

    get contactsPartialDataContent() {
        this._sharedStringsData = `count="8" uniqueCount="7"><si><t>name</t></si><si><t>phone</t></si><si><t>Terrance Orta</t></si><si>` +
            `<t>770-504-2217</t></si><si><t>Richard Mahoney LongerName</t></si><si><t></t></si><si><t>780-555-1331</t></si>`;

        this._tableData = `ref="A1:B4" totalsRowShown="0">
        <autoFilter ref="A1:B4"/><tableColumns count="2"><tableColumn id="1" name="name"/><tableColumn id="2" name="phone"/></tableColumns>`;

        this._worksheetData = `<dimension ref="A1:B4"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>` +
            `<sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="30.169921875" customWidth="1"/>` +
            `<col min="2" max="2" width="13.633593750000001" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c>` +
            `<c r="B1" t="s"><v>1</v></c></row><row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2" t="s"><v>3</v></c></row><row r="3"><c r="A3" t="s">` +
            `<v>4</v></c><c r="B3" t="s"><v>5</v></c></row><row r="4"><c r="A4" t="s"><v>5</v></c><c r="B4" t="s"><v>6</v></c></row></sheetData>`;

        return this.createData();
    }

    get noHeadersStringDataContent() {
        this._sharedStringsData = `count="6" uniqueCount="6"><si><t>Column1</t></si><si><t>Terrance Orta</t></si><si><t>Richard Mahoney LongerName</t></si><si><t>Donna Price</t></si><si><t>Lisa Landers</t></si><si><t>Dorothy H. Spencer</t></si>`;
        this._tableData = `ref="A1:A6" totalsRowShown="0"><autoFilter ref="A1:A6"/><tableColumns count="1"><tableColumn id="1" name="Column1"/></tableColumns>`;
        this._worksheetData = `<dimension ref="A1:A6"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="30.169921875" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c></row><row r="2"><c r="A2" t="s"><v>1</v></c></row><row r="3"><c r="A3" t="s"><v>2</v></c></row><row r="4"><c r="A4" t="s"><v>3</v></c></row><row r="5"><c r="A5" t="s"><v>4</v></c></row><row r="6"><c r="A6" t="s"><v>5</v></c></row></sheetData>`;

        return this.createData();
    }

    get noHeadersObjectDataContent() {
        this._sharedStringsData = `count="4" uniqueCount="4"><si><t>value</t></si><si><t>1</t></si><si><t>2</t></si><si><t>3</t></si>`;
        this._tableData = `ref="A1:A4" totalsRowShown="0"><autoFilter ref="A1:A4"/><tableColumns count="1"><tableColumn id="1" name="value"/></tableColumns>`;
        this._worksheetData = `<dimension ref="A1:A4"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="8.34" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c></row><row r="2"><c r="A2" t="s"><v>1</v></c></row><row r="3"><c r="A3" t="s"><v>2</v></c></row><row r="4"><c r="A4" t="s"><v>3</v></c></row></sheetData>`;

        return this.createData();
    }

    get simpleGridDataContent() {
        this._sharedStringsData = `count="44" uniqueCount="42"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>HireDate</t></si><si><t>1</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>2017-06-19T11:43:07.714Z</t></si><si><t>2</t></si><si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>2015-12-18T11:23:17.714Z</t></si><si><t>3</t></si><si><t>Tanya Bennett</t></si><si><t>2005-11-18T11:23:17.714Z</t></si><si><t>4</t></si><si><t>Jack Simon</t></si><si><t>Software Developer</t></si><si><t>2008-12-18T11:23:17.714Z</t></si><si><t>5</t></si><si><t>Celia Martinez</t></si><si><t>Senior Software Developer</t></si><si><t>2007-12-19T11:23:17.714Z</t></si><si><t>6</t></si><si><t>Erma Walsh</t></si><si><t>CEO</t></si><si><t>2016-12-18T11:23:17.714Z</t></si><si><t>7</t></si><si><t>Debra Morton</t></si><si><t>Associate Software Developer</t></si><si><t>2005-11-19T11:23:17.714Z</t></si><si><t>8</t></si><si><t>Erika Wells</t></si><si><t>Software Development Team Lead</t></si><si><t>2005-10-14T11:23:17.714Z</t></si><si><t>9</t></si><si><t>Leslie Hansen</t></si><si><t>2013-10-10T11:23:17.714Z</t></si><si><t>10</t></si><si><t>Eduardo Ramirez</t></si><si><t>Manager</t></si><si><t>2011-11-28T11:23:17.714Z</t></si>`;

        this._tableData = `ref="A1:D11" totalsRowShown="0">
        <autoFilter ref="A1:D11"/><tableColumns count="4"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/>` +
        `<tableColumn id="3" name="JobTitle"/><tableColumn id="4" name="HireDate"/></tableColumns>`;

        this._worksheetData = `<dimension ref="A1:D11"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="8.34" customWidth="1"/><col min="2" max="2" width="16.52578125" customWidth="1"/><col min="3" max="3" width="33.287109375" customWidth="1"/><col min="4" max="4" width="26.33203125" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c></row><row r="2"><c r="A2" t="s"><v>4</v></c><c r="B2" t="s"><v>5</v></c><c r="C2" t="s"><v>6</v></c><c r="D2" t="s"><v>7</v></c></row><row r="3"><c r="A3" t="s"><v>8</v></c><c r="B3" t="s"><v>9</v></c><c r="C3" t="s"><v>10</v></c><c r="D3" t="s"><v>11</v></c></row><row r="4"><c r="A4" t="s"><v>12</v></c><c r="B4" t="s"><v>13</v></c><c r="C4" t="s"><v>10</v></c><c r="D4" t="s"><v>14</v></c></row><row r="5"><c r="A5" t="s"><v>15</v></c><c r="B5" t="s"><v>16</v></c><c r="C5" t="s"><v>17</v></c><c r="D5" t="s"><v>18</v></c></row><row r="6"><c r="A6" t="s"><v>19</v></c><c r="B6" t="s"><v>20</v></c><c r="C6" t="s"><v>21</v></c><c r="D6" t="s"><v>22</v></c></row><row r="7"><c r="A7" t="s"><v>23</v></c><c r="B7" t="s"><v>24</v></c><c r="C7" t="s"><v>25</v></c><c r="D7" t="s"><v>26</v></c></row><row r="8"><c r="A8" t="s"><v>27</v></c><c r="B8" t="s"><v>28</v></c><c r="C8" t="s"><v>29</v></c><c r="D8" t="s"><v>30</v></c></row><row r="9"><c r="A9" t="s"><v>31</v></c><c r="B9" t="s"><v>32</v></c><c r="C9" t="s"><v>33</v></c><c r="D9" t="s"><v>34</v></c></row><row r="10"><c r="A10" t="s"><v>35</v></c><c r="B10" t="s"><v>36</v></c><c r="C10" t="s"><v>29</v></c><c r="D10" t="s"><v>37</v></c></row><row r="11"><c r="A11" t="s"><v>38</v></c><c r="B11" t="s"><v>39</v></c><c r="C11" t="s"><v>40</v></c><c r="D11" t="s"><v>41</v></c></row></sheetData>`;

        return this.createData();
    }

    get simpleGridDataPage1() {
        this._sharedStringsData = `count="16" uniqueCount="15"><si><t>ID</t></si><si><t>Name</t></si><si><t>JobTitle</t></si><si><t>HireDate</t>` +
        `</si><si><t>1</t></si><si><t>Casey Houston</t></si><si><t>Vice President</t></si><si><t>2017-06-19T11:43:07.714Z</t></si><si><t>2</t></si>` +
        `<si><t>Gilberto Todd</t></si><si><t>Director</t></si><si><t>2015-12-18T11:23:17.714Z</t></si><si><t>3</t></si><si><t>Tanya Bennett</t></si>` +
        `<si><t>2005-11-18T11:23:17.714Z</t></si>`;

        this._tableData = `ref="A1:D4" totalsRowShown="0">
            <autoFilter ref="A1:D4"/><tableColumns count="4"><tableColumn id="1" name="ID"/><tableColumn id="2" name="Name"/>` +
            `<tableColumn id="3" name="JobTitle"/><tableColumn id="4" name="HireDate"/></tableColumns>`;

        this._worksheetData = `<dimension ref="A1:D4"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews>` +
        `<sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><cols><col min="1" max="1" width="8.34" customWidth="1"/>` +
        `<col min="2" max="2" width="14.416406250000001" customWidth="1"/><col min="3" max="3" width="13.890234375" customWidth="1"/>` +
        `<col min="4" max="4" width="26.33203125" customWidth="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c>` +
        `<c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c></row><row r="2"><c r="A2" t="s"><v>4</v>` +
        `</c><c r="B2" t="s"><v>5</v></c><c r="C2" t="s"><v>6</v></c><c r="D2" t="s"><v>7</v></c></row><row r="3"><c r="A3" t="s"><v>8</v>` +
        `</c><c r="B3" t="s"><v>9</v></c><c r="C3" t="s"><v>10</v></c><c r="D3" t="s"><v>11</v></c></row><row r="4"><c r="A4" t="s">` +
        `<v>12</v></c><c r="B4" t="s"><v>13</v></c><c r="C4" t="s"><v>10</v></c><c r="D4" t="s"><v>14</v></c></row></sheetData>`;

        return this.createData();
    }
}

