import * as JSZip from 'jszip';
import { ExcelFileTypes } from './excel-enums';
import { JSZipFiles } from './jszip-helper.spec';

export class JSZipWrapper {
    private _zip: JSZip;
    private _filesAndFolders: string[];
    private _fileContent = '';
    private _files: {[key: string]: JSZip.JSZipObject};
    private _filesContent: IFileContent[] = [];
    private _hasValues = true;

    constructor(currentZip: JSZip) {
        this._zip = currentZip;
        this._files = currentZip.files;
        this.createFilesAndFolders();
        this._hasValues = this._filesAndFolders.length > JSZipFiles.templatesNames.length;
        this._filesContent = [];
    }

    /* Asserts the JSZip contains the files it should contain. */
    public verifyStructure(message = '') {
        let result = ObjectComparer.AreEqual(this.templateFilesAndFolders, JSZipFiles.templatesNames);

        result = (this.hasValues) ?
                    result && ObjectComparer.AreEqual(this.dataFilesAndFolders, JSZipFiles.dataFilesAndFoldersNames) :
                    result && this._filesAndFolders.length === JSZipFiles.templatesNames.length;

        expect(result).toBe(true, message + ' Unexpected zip structure!');
    }

    /* Verifies the contents of all template files and asserts the result.
    Optionally, a message can be passed in, which, if specified, will be shown in the beginning of the comparison result. */
    public async verifyTemplateFilesContent(message = '', hasDates = false) {
        JSZipFiles.hasDates = hasDates;

        let result;
        const msg = (message !== '') ? message + '\r\n' : '';

        await this.readTemplateFiles().then(() => {
            result = this.compareFiles(this.templateFilesContent, undefined);
            expect(result.areEqual).toBe(true, msg + result.differences);
        });
    }

    /* Verifies the contents of all data files and asserts the result.
    Optionally, a message can be passed in, which, if specified, will be shown in the beginning of the comparison result. */
    public async verifyDataFilesContent(expectedData: IFileContent[], message = '') {
        let result;
        const msg = (message !== '') ? message + '\r\n' : '';

        await this.readDataFiles().then(() => {
            result = this.compareFiles(this.dataFilesContent, expectedData);
            expect(result.areEqual).toBe(true, msg + result.differences);
        });
    }

    private createFilesAndFolders() {
        this._filesAndFolders = Object.keys(this._files).map(f => f);
    }

    public get templateFilesAndFolders(): string[] {
        return this._filesAndFolders.filter((name) => JSZipFiles.templatesNames.indexOf(name) !== -1);
    }

    public get dataFilesAndFolders(): string[] {
        return this._filesAndFolders.filter((name) => JSZipFiles.dataFilesAndFoldersNames.indexOf(name) !== -1);
    }

    public get dataFilesOnly(): string[] {
        return this.getFiles(this.dataFilesAndFolders);
    }

    public get templateFilesOnly(): string[] {
        return this.getFiles(this.templateFilesAndFolders);
    }

    public get hasValues() {
        return this._hasValues;
    }

    private getFiles(collection: string[]) {
        return collection.filter((f) => this._files[f].dir === false);
    }

    /* Loads and reads a file asynchronously. */
    private async readFile(fileName: string) {
        if (this._zip === undefined) {
            return 'Zip file not found!';
        }

        await this._files[fileName].async('text')
        .then((txt) => {
                this._fileContent = txt;
        });
    }

    /* Reads all files and stores their contents in this._filesContent. */
    private async readFiles(files: string[]) {
        // const self = this;
        this._filesContent = [];
        for (const file of files) {
            await this.readFile(file).then(() => {
                const content = this._fileContent;
                this._filesContent.push({
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
        const actualTemplates = (this.hasValues) ? this.templateFilesOnly.filter((f) =>
                                f !== JSZipFiles.templatesNames[11]) : this.templateFilesOnly;
        await this.readFiles(actualTemplates);
    }

    public get templateFilesContent(): IFileContent[] {
        const actualTemplates = (this.hasValues) ? this.templateFilesOnly.filter((f) =>
                                f !== JSZipFiles.templatesNames[11]) : this.templateFilesOnly;
        return this._filesContent.filter((c) => actualTemplates.indexOf(c.fileName) > -1);
    }

    public get dataFilesContent(): IFileContent[] {
        return this._filesContent.filter((c) => this.dataFilesOnly.indexOf(c.fileName) > -1);
    }

    /* Formats the result of two files comparison by displaying both the actual and expected content. */
    private formatDifferences(differences, fileName, actualContent, expectedContent): string {
        differences = `${differences}
                        ------------------ ${fileName} ------------------
                        =================== Actual content ======================
                        ${actualContent}
                        =================== Expected content ====================
                        ${expectedContent}`;
        return differences;
    }

    /* Compares the content of two files based on the provided file type and expected value data. */
    private compareFilesContent(currentContent: string, fileType: ExcelFileTypes, fileData: string) {
        let result = true;
        let differences = '';
        const expectedFile = JSZipFiles.createExpectedXML(fileType, fileData, this.hasValues);
        const expectedContent = expectedFile.content;
        result = ObjectComparer.AreEqualXmls(currentContent, expectedContent);
        if (!result) {
            differences = this.formatDifferences(differences, expectedFile.name, currentContent, expectedContent);
        }

        return { areEqual: result, differences };
    }

    private compareContent(currentFile: IFileContent, expectedData: string) {
        let result = true;
        let differences = '';

        const fileType = this.getFileTypeByName(currentFile.fileName);

        if (fileType !== undefined) {
            const comparisonResult = this.compareFilesContent(currentFile.fileContent, fileType, expectedData);
            result = comparisonResult.areEqual;
            if (!result) {
                differences = comparisonResult.differences;
            }
        }

        return { areEqual: result, differences };

    }

    /* Compares the contents of the provided files to their expected values. */
    private compareFiles(actualFilesContent: IFileContent[], expectedFilesData: IFileContent[]) {
        let result = true;
        let differences = '';
        for (const current of actualFilesContent) {
            const index = (expectedFilesData !== undefined) ? expectedFilesData.findIndex((f) => f.fileName === current.fileName) : -1;
            const excelData = (index > -1 && expectedFilesData[index] !== undefined) ? expectedFilesData[index].fileContent : '';
            const comparisonResult = this.compareContent(current, excelData);
            result = result && comparisonResult.areEqual;
            if (!comparisonResult.areEqual) {
                differences = differences + comparisonResult.differences;
            }
        }

        return { areEqual: result, differences };
    }

    /* Returns file's name based on its type. */
    private getFileNameByType(type: ExcelFileTypes) {
        const file = JSZipFiles.files.find((f) => f.type === type);
        return (file !== undefined) ? file.name : '';
    }

    /* Returns file's type based on its name. */
    private getFileTypeByName(name: string) {
        const file = JSZipFiles.files.find((f) => f.name === name);
        return (file !== undefined) ? file.type : undefined;
    }
}

export interface IFileContent {
    fileName: string;
    fileContent: string;
}

export class ObjectComparer {
    public static AreEqual(actual, template): boolean {

        if (!ObjectComparer.compareTypesAndLength(actual, template)) {
            return false;
        }

        let result = true;

        // Compare properties
        if (Object.prototype.toString.call(actual) === '[object Array]') {
            for (let i = 0; i < actual.length; i++) {
                result = (result && actual[i] === template[i]);
            }
        } else {
            for (const key in actual) {
                if (actual.hasOwnProperty(key)) {
                    // Compare the item
                }
            }
        }

        return result;
    }

    public static AreSimilar(actual, template): boolean {

        if (!ObjectComparer.compareTypesAndLength(actual, template)) {
            return false;
        }

        let result = true;

        // Compare properties
        if (Object.prototype.toString.call(actual) === '[object Array]') {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < actual.length; i++) {
                result = (result && template.indexof(actual[i]) >= 0);
            }
        } else {
            for (const key in actual) {
                if (actual.hasOwnProperty(key)) {
                    // Compare the item
                }
            }
        }

        return result;
    }

    public static AreEqualXmls(actualXML: string, expectedXML: string) {
        const regex = /(\r\n|\n|\r|\t|\s+)/g;
        // /(\r\n|\n|\r|\t)/g;
        const actual = actualXML.replace(regex, '');
        const expected = expectedXML.replace(regex, '');

        return actual === expected;
    }

    protected static compareTypesAndLength(actual, template): boolean {

        const actualType = Object.prototype.toString.call(actual);
        const templateType = Object.prototype.toString.call(template);

        if (actualType !== templateType) {
            return false;
        }
        // If items are not an object or array, return false
        if (['[object Array]', '[object Object]'].indexOf(actualType) < 0) {
            return false;
        }
        const actualLength = actualType === '[object Array]' ? actual.length : Object.keys(actual).length;
        const templateLength = templateType === '[object Array]' ? template.length : Object.keys(template).length;

        if (actualLength !== templateLength) {
            return false;
        }
        return true;
    }
}
