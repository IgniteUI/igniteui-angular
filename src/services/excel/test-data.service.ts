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
    jsZip = new JSZip();
    templateZip = new JSZip();

    constructor(currentZip : JSZip, templateZip : JSZip) {
        this.jsZip = currentZip;
        this.templateZip = templateZip;
    }

    public verifyStructure() {
        var test = this.ReadTemplate(this.templateZip);
    }

    public ReadTemplate(templateZip : JSZip) : string {
        let result = "";
        JSZip.loadAsync(templateZip).then(function(zip) {
            zip.forEach(function (relativePath, zipEntry) {
                result += zipEntry;
            })
        });

        return result;
    }
}

export class JSZipObjectWrapper {
    constructor (zipObject : ZipObject) {}
}

