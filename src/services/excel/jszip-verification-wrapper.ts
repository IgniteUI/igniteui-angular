import * as JSZip from 'jszip/dist/jszip';
import { ExcelFileTypes } from './excel-enums';
import { JSZipFiles } from './jsZip-helper';

export class JSZipWrapper {
    private _zip : JSZip;
    private _filesAndFolders : JSZip.ZipObject[];
    private _fileContent = "";
    private _files : any[];
    // private _actualFiles : any[];
    private _filesContent : IFileContent[] = [];
    private _hasValues = true;

    constructor(currentZip : JSZip) {
        this._zip = currentZip;
        this._files = currentZip.files;
        this.createFilesAndFolders();
        this._hasValues = this._filesAndFolders.length > JSZipFiles.TemplatesNames.length;
        this._filesContent = [];
    }

    private createFilesAndFolders() {
        this._filesAndFolders = Object.keys(this._files).map(function(f : JSZip.ZipObject) {
            return f;
        });
    }

    get templateFilesAndFolders() : JSZip.ZipObject[] {
        return this._filesAndFolders.filter((name) => JSZipFiles.TemplatesNames.indexOf(name) != -1);
    }

    get dataFilesAndFolders() : JSZip.ZipObject[] {
        return this._filesAndFolders.filter((name) => JSZipFiles.DataFilesAndFoldersNames.indexOf(name) != -1);
    }

    get dataFilesOnly() : JSZip.ZipObject[] {
        return this.getFiles(this.dataFilesAndFolders);
    }

    get templateFilesOnly() : JSZip.ZipObject[] {
        return this.getFiles(this.templateFilesAndFolders);
    }

    get hasValues() {
        return this._hasValues;
    }

    private getFiles(collection : JSZip.ZipObject[] ) {
        return collection.filter((f) => this._files[f].dir === false);
    };

    /* Loads and reads a file asynchronously. */
    private async readFile(fileName : string) {
        const self = this;
        if (this._zip === undefined)
            return "Zip file not found!";

        await this._files[fileName].async("string")
        .then(function(txt) {
                self._fileContent = txt;
        });
    }

    /* Reads all files and stores their contents in this._filesContent. */
    private async readFiles(files : any[]) {
        const self = this;
        this._filesContent = [];
        for (let file of files) {
            await self.readFile(file).then(() => {
                let content = self._fileContent;
                self._filesContent.push({
                    fileName : file,
                    fileContent : content
                });
            });
        }
    }

    private async readDataFiles() {
        await this.readFiles(this.dataFilesOnly);
    }

    private async readTemplateFiles() {
        let actualTemplates = (this.hasValues) ? this.templateFilesOnly.filter((f) => f !== JSZipFiles.TemplatesNames[11]) : this.templateFilesOnly;
        await this.readFiles(actualTemplates);
    }

    get templateFilesContent() : IFileContent[] {
        let actualTemplates = (this.hasValues) ? this.templateFilesOnly.filter((f) => f !== JSZipFiles.TemplatesNames[11]) : this.templateFilesOnly;
        return this._filesContent.filter((c) => actualTemplates.indexOf(c.fileName) > -1);
    }

    get dataFilesContent() : IFileContent[] {
        return this._filesContent.filter((c) => this.dataFilesOnly.indexOf(c.fileName) > -1);
    }

    /* Formats the result of two files comparison by displaying both the actual and expected content. */
    private formatDifferences(differences, fileName, actualContent, expectedContent) : string {
        differences = `${differences}
                        ------------------ ${fileName} ------------------
                        =================== Actual content ======================
                        ${actualContent}
                        =================== Expected content ====================
                        ${expectedContent}`;
        return differences;
    }

    /* Asserts the JSZip contains the files it should contain. */
    public verifyStructure(message = "") {
        let result = ObjectComparer.AreEqual(this.templateFilesAndFolders, JSZipFiles.TemplatesNames);

        if (this.hasValues) {
            result = result && ObjectComparer.AreEqual(this.dataFilesAndFolders, JSZipFiles.DataFilesAndFoldersNames);
        }
        else {
            result = result && this._filesAndFolders.length === JSZipFiles.TemplatesNames.length;
        }

        expect(result).toBe(true, message + " Unexpected zip structure!")
    }

    /* Verifies the contents of all template files and asserts the result.
    Optionally, a message can be passed in, which, if specified, will be shown in the beginning of the comparison result. */
    public async verifyTemplateFilesContent(message = "") {
        let result;
        let msg = (message !== "") ? message + "\r\n" : "";

        await this.readTemplateFiles().then(() => {
            result = this.compareFiles(this.templateFilesContent, undefined);
            expect(result.areEqual).toBe(true, msg + result.differences);
        });
    }

    /* Verifies the contents of all data files and asserts the result.
    Optionally, a message can be passed in, which, if specified, will be shown in the beginning of the comparison result. */
    public async verifyDataFilesContent(expectedData : IFileContent[], message = "") {
        let result;
        let msg = (message !== "") ? message + "\r\n" : "";

        await this.readDataFiles().then(() => {
            result = this.compareFiles(this.dataFilesContent, expectedData);
            expect(result.areEqual).toBe(true, msg + result.differences);
        });
    }

    /* Verifies the contents of all files and asserts the result.
    Optionally, a message can be passed in, which, if specified, will be shown in the beginning of the comparison result. */
    public async verifyFilesContent(expectedData : IFileContent[], message = "") {
        const self = this;
        let result;
        let msg = (message !== "") ? message + "\r\n" : "";

        await this.readFiles(this._files).then(() => {
            result = this.compareFiles(self._filesContent, expectedData);
            expect(result.areEqual).toBe(true, msg + result.differences);
        });
    }

    /* Compares the content of two files based on the provided file type and expected value data. */
    private compareFilesContent(currentContent : string, fileType : ExcelFileTypes, fileData : string) {
        let result = true;
        let differences = "";
        let expectedFile = JSZipFiles.createExpectedXML(fileType, fileData, this.hasValues);
        let expectedContent = expectedFile.content;
        result = ObjectComparer.AreEqualXmls(currentContent, expectedContent);
        if (!result) {
            differences = this.formatDifferences(differences, expectedFile.name, currentContent, expectedContent);
        }

        return { areEqual: result, differences : differences };
    }


    private compareContent(currentFile : IFileContent, expectedData : string) {
        let result = true;
        let differences = "";

        let fileType = this.getFileTypeByName(currentFile.fileName);

        if (fileType !== undefined) {
            let comparisonResult = this.compareFilesContent(currentFile.fileContent, fileType, expectedData);
            result = comparisonResult.areEqual;
            if (!result) {
                differences = comparisonResult.differences;
            }
        }

        return { areEqual: result, differences : differences };


    }

    /* Compares the contents of the provided files to their expected values. */
    private compareFiles(actualFilesContent : IFileContent[], expectedFilesData : IFileContent[]) {
        let result = true;
        let differences = "";
        for (let current of actualFilesContent) {
            let index = (expectedFilesData !== undefined) ? expectedFilesData.findIndex((f) => f.fileName === current.fileName) : -1;
            let excelData = (index > -1 && expectedFilesData[index] !== undefined) ? expectedFilesData[index].fileContent : "";
            let comparisonResult = this.compareContent(current, excelData);
            result = result && comparisonResult.areEqual;
            if (!comparisonResult.areEqual) {
                differences = differences + comparisonResult.differences;
            }
        }

        return { areEqual: result, differences : differences };
    }

    /* Returns file's name based on its type. */
    private getFileNameByType(type : ExcelFileTypes) {
        let file = JSZipFiles.Files.find((f) => f.type === type);
        return (file !== undefined) ? file.name : "";
    }

    /* Returns file's type based on its name. */
    private getFileTypeByName(name : string) {
        let file = JSZipFiles.Files.find((f) => f.name === name);
        return (file !== undefined) ? file.type : undefined;
    }
}

export interface IFileContent {
    fileName : string;
    fileContent : string;
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

    public static AreEqualXmls(actualXML : string, expectedXML : string) {
        let regex = /(\r\n|\n|\r|\t|\s+)/g;
        // /(\r\n|\n|\r|\t)/g;
        let actual = actualXML.replace(regex,"");
        let expected = expectedXML.replace(regex,"");

        return actual === expected;
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
