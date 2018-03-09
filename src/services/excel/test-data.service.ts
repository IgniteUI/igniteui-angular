import { Injectable } from '@angular/core';
import * as JSZip from 'jszip/dist/jszip';

@Injectable()
export class ExportTestDataService {

    differentTypesData = [
        { Number: 1, String: "1", Boolean: true, Date: new Date(2018, 3, 3) },
        { Number: 2, String: "2", Boolean: false, Date: new Date(2018, 5, 6) },
        { Number: 3, String: "3", Boolean: true, Date: new Date(2018, 9, 22) }
    ];

    contacts = [{
        name: "Terrance Orta",
        phone: "770-504-2217"
    }, {
        name: "Richard Mahoney LongerName",
        phone: ""
    }, {
        name: "Donna Price",
        phone: "859-496-2817"
    }, {
        name: "Lisa Landers",
        phone: "901-747-3428"
    }, {
        name: "Dorothy H. Spencer",
        phone: "573-394-9254"
    }];

    contactsMissing = [
        {
        name: "Terrance Orta",
        phone: "770-504-2217"
    }, {
        name: "Richard Mahoney LongerName",
    }
];
    noHeadersStringData = [
        "Terrance Orta",
        "Richard Mahoney LongerName",
        "Donna Price",
        "Lisa Landers",
        "Dorothy H. Spencer"
        ];

    noHeadersObjectData = [
        new ValueData("1"),
        new ValueData("2"),
        new ValueData("3")
    ];

    emptyObjectData = [
        {},
        {},
        {}
    ];

    constructor() { }

    public getDifferentTypesData() {
        return this.differentTypesData;
    }

    public getContactsData() {
        return this.contacts;
    }

    public getEmptyObjectData() {
        return this.emptyObjectData;
    }

    public getNoHeadersObjectData() {
        return this.noHeadersObjectData;
    }

    public getNoHeadersStringData() {
        return this.noHeadersStringData;
    }
}

export class ValueData {
    public value : string;

    constructor(value : string) {
        this.value = value;
    }
}

export class JSZipWrapper {

    private _zip : JSZip;
    private _filesAndFoldersNames : string[];
    private _filesNames : string[];
    private _foldersNames : string[];
    public fileContent : string;

    constructor(currentZip : JSZip) {
        // if (currentZip !== undefined) {
            this.createWrapper(currentZip);
            this.getFilesAndFolders();
        // }
    }

    async createWrapper(jsZip) {
        return await this.createPromise(jsZip);
    }
    createPromise(jsZip) : Promise<JSZipWrapper> {
        return new Promise<JSZipWrapper>(resolve => {
            setTimeout((done) => {
                resolve(jsZip);
                this._zip = jsZip;
                done();
            }, 1000);
        }).then(() => Promise.reject(jsZip));
    }

    get filesAndFoldersNames() : string[] {
        return this._filesAndFoldersNames;
    }

    get filesNames() : string[] {
        return this._filesNames;
    }

    get foldersNames() : string[] {
        return this._foldersNames;
    }

    private getFilesAndFolders() {
        this._filesAndFoldersNames = Object.keys(this._zip.files).map(function(f : JSZip.ZipObject) {
            return f;
        });

        return this._filesAndFoldersNames;
    };

    private getFolders() {
        this._foldersNames = this._filesAndFoldersNames.filter((f) => this._zip.files[f].dir === true)
            .map(function(f : JSZip.ZipObject) {
                return f;
            });

        return this._foldersNames;
    };

    private getFiles() {
        this._filesAndFoldersNames = this._filesAndFoldersNames.filter((f) => this._zip.files[f].dir === false)
            .map(function(f : JSZip.ZipObject) {
                return f;
            });

        return this._filesNames;
    };

    public async readFile(fileName : string) {
        const self = this;
        if (this._zip === undefined)
            return "Zip file not found!";
        let content = "";
        await this._zip.files[fileName].async("string")
        .then(function(txt) {
                self.fileContent = txt;
            });
    }

    public verifyStructure() : boolean {
        let result : boolean = true;
        let result1 = this._zip.getFilesAndFolders();

        return result;
    }
}

export class JSZipFiles {
    public static AllFilesList : string[] = [
        "_rels/",
        "_rels/.rels",
        "docProps/",
        "docProps/app.xml",
        "docProps/core.xml",
        "xl/",
        "xl/_rels/",
        "xl/_rels/workbook.xml.rels",
        "xl/theme/",
        "xl/theme/theme1.xml",
        "xl/worksheets/",
        "xl/worksheets/sheet1.xml",
        "xl/styles.xml",
        "xl/workbook.xml",
        "[Content_Types].xml"
    ];

    public static FoldersNamesList : string[] = [
        "_rels/",
        "docProps/",
        "xl/",
        "xl/_rels/",
        "xl/theme/",
        "xl/worksheets/"
    ];

    public static FilesNamesList : string[] = [
        "_rels/.rels",
        "docProps/app.xml",
        "docProps/core.xml",
        "xl/_rels/workbook.xml.rels",
        "xl/styles.xml",
        "xl/theme/theme1.xml",
        "xl/workbook.xml",
        "xl/worksheets/sheet1.xml",
        "[Content_Types].xml"
    ];

    /* The content of '_rels/.rels' file. */
    public static relsFileContent : string;

    /* The content of 'docProps/app.xml' file. */
    public static appFileContent : string;

    /* The content of 'docProps/core.xml' file. */
    public static coreFileContent : string;

    /* The content of 'xl/_rels' file. */
    public static xlRelsFileContent : string;

    /* The content of 'xl/_rels/workbook.xml.rels' file. */
    public static workbookRelsFileContent : string;

    /* The content of 'xl/styles.xml' file. */
    public static stylesFileContent : string;

    /* The content of 'xl/theme/theme1.xml' file. */
    public static themeFileContent : string;

    /* The content of 'xl/workbook.xml' file. */
    public static workbookFileContent : string;

    /* The content of 'xl/worksheets/sheet1.xml' file. */
    public static sheetFileContent : string;

    /* The content of '[Content_Types].xml' file. */
    public static typesFileContent : string;
}

export class ObjectComparer {
    public static AreEqual(actual, template) : boolean {

        if (!ObjectComparer.compareTypesAndLength(actual, template))
            return false;

        let result = true;

        // Compare properties
        if (Object.prototype.toString.call(actual) === '[object Array]') {
            for (var i = 0; i < actual.length; i++) {
                result = (result && actual[i] === template[i]);
            }
        } else {
            for (var key in actual) {
                if (actual.hasOwnProperty(key)) {
                    // Compare the item
                }
            }
        }

        return result;
    }

    public static AreSimilar(actual, template) : boolean {

        if (!ObjectComparer.compareTypesAndLength(actual, template))
            return false;

        let result = true;

        // Compare properties
        if (Object.prototype.toString.call(actual) === '[object Array]') {
            for (var i = 0; i < actual.length; i++) {
                result = (result && template.indexof(actual[i]) >= 0);
            }
        } else {
            for (var key in actual) {
                if (actual.hasOwnProperty(key)) {
                    // Compare the item
                }
            }
        }

        return result;
    }

    protected static compareTypesAndLength(actual, template) : boolean {

        let actualType = Object.prototype.toString.call(actual);
        let templateType = Object.prototype.toString.call(template);

        if (actualType !== templateType) return false;

        // If items are not an object or array, return false
        if (['[object Array]', '[object Object]'].indexOf(actualType) < 0) return false;

        let actualLength = actualType === '[object Array]' ? actual.length : Object.keys(actual).length;
        let templateLength = templateType === '[object Array]' ? template.length : Object.keys(template).length;

        if (actualLength !== templateLength) return false;

        return true;
    }
}

