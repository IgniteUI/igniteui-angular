import { strFromU8 } from 'fflate';
import { ExcelFileTypes } from './excel-enums';
import { ZipFiles } from './zip-helper.spec';

export class ZipWrapper {
    private _zip: Object;
    private _filesAndFolders: string[];
    private _files: Map<string, Uint8Array>;
    private _filesContent: IFileContent[] = [];
    private _hasValues = true;

    constructor(currentZip: Object) {
        this._zip = currentZip;
        this._files = new Map<string, Uint8Array>();
        this._filesAndFolders = [];
        this.createFilesAndFolders(this._zip, '');
        this._hasValues = this._filesAndFolders.length > ZipFiles.templatesNames.length;
        this._filesContent = [];
    }

    /* Asserts the zip contains the files it should contain. */
    public verifyStructure(isHGrid = false, message = '') {
        let result = ObjectComparer.AreEqual(this.templateFilesAndFolders, ZipFiles.templatesNames);
        const template = isHGrid ? ZipFiles.hGridDataFilesAndFoldersNames : ZipFiles.dataFilesAndFoldersNames;

        result = (this.hasValues) ?
            result && ObjectComparer.AreEqual(this.dataFilesAndFolders, template) :
            result && this._filesAndFolders.length === ZipFiles.templatesNames.length;

        expect(result).toBe(true, message + ' Unexpected zip structure!');
    }

    /* Verifies the contents of all template files and asserts the result.
    Optionally, a message can be passed in, which, if specified, will be shown in the beginning of the comparison result. */
    public async verifyTemplateFilesContent(message = '', hasDates = false) {
        ZipFiles.hasDates = hasDates;

        let result;
        const msg = (message !== '') ? message + '\r\n' : '';

        await this.readTemplateFiles().then(() => {
            result = this.compareFiles(this.templateFilesContent, undefined);
            expect(result.areEqual).toBe(true, msg + result.differences);
        });
    }

    /* Verifies the contents of all data files and asserts the result.
    Optionally, a message can be passed in, which, if specified, will be shown in the beginning of the comparison result. */
    public async verifyDataFilesContent(expectedData: IFileContent[], message = '', isHGrid = false) {
        let result;
        const msg = (message !== '') ? message + '\r\n' : '';

        await this.readDataFiles().then(() => {
            result = this.compareFiles(this.dataFilesContent, expectedData, isHGrid);
            expect(result.areEqual).toBe(true, msg + result.differences);
        });
    }

    private createFilesAndFolders(obj: Object, prefix: string) {
        Object.keys(obj).forEach((key) => {
            if (ArrayBuffer.isView(obj[key])) {
                this._files.set(`${prefix}${key}`, obj[key] as Uint8Array);
                this._filesAndFolders.push(`${prefix}${key}`);
            } else {
                const newPrefix = `${prefix}${key}/`;
                this._filesAndFolders.push(newPrefix);
                this.createFilesAndFolders(obj[key], newPrefix);
            }
        });
    }

    public get templateFilesAndFolders(): string[] {
        return this._filesAndFolders.filter((name) => ZipFiles.templatesNames.indexOf(name) !== -1);
    }

    public get dataFilesAndFolders(): string[] {
        return this._filesAndFolders.filter((name) => ZipFiles.dataFilesAndFoldersNames.indexOf(name) !== -1);
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
        return collection.filter((f) => f.endsWith('/') === false);
    }

    /* Reads all files and stores their contents in this._filesContent. */
    private readFiles(files: string[]) {
        // const self = this;
        this._filesContent = [];
        for (const file of files) {
            const content = strFromU8(this._files.get(file));
            this._filesContent.push({
                fileName: file,
                fileContent: content
            });
        }
    }

    private async readDataFiles() {
        await this.readFiles(this.dataFilesOnly);
    }

    private async readTemplateFiles() {
        const actualTemplates = (this.hasValues) ? this.templateFilesOnly.filter((f) =>
            f !== ZipFiles.templatesNames[11]) : this.templateFilesOnly;
        await this.readFiles(actualTemplates);
    }

    public get templateFilesContent(): IFileContent[] {
        const actualTemplates = (this.hasValues) ? this.templateFilesOnly.filter((f) =>
            f !== ZipFiles.templatesNames[11]) : this.templateFilesOnly;
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
    private compareFilesContent(currentContent: string, fileType: ExcelFileTypes, fileData: string, isHGrid) {
        let result = true;
        let differences = '';
        const expectedFile = ZipFiles.createExpectedXML(fileType, fileData, this.hasValues, isHGrid);
        const expectedContent = expectedFile.content;
        result = ObjectComparer.AreEqualXmls(currentContent, expectedContent);
        if (!result) {
            differences = this.formatDifferences(differences, expectedFile.name, currentContent, expectedContent);
        }

        return { areEqual: result, differences };
    }

    private compareContent(currentFile: IFileContent, expectedData: string, isHGrid) {
        let result = true;
        let differences = '';

        const fileType = this.getFileTypeByName(currentFile.fileName);

        if (fileType !== undefined) {
            const comparisonResult = this.compareFilesContent(currentFile.fileContent, fileType, expectedData, isHGrid);
            result = comparisonResult.areEqual;
            if (!result) {
                differences = comparisonResult.differences;
            }
        }

        return { areEqual: result, differences };

    }

    /* Compares the contents of the provided files to their expected values. */
    private compareFiles(actualFilesContent: IFileContent[], expectedFilesData: IFileContent[], isHGrid = false) {
        let result = true;
        let differences = '';
        for (const current of actualFilesContent) {
            const index = (expectedFilesData !== undefined) ? expectedFilesData.findIndex((f) => f.fileName === current.fileName) : -1;
            const excelData = (index > -1 && expectedFilesData[index] !== undefined) ? expectedFilesData[index].fileContent : '';
            const comparisonResult = this.compareContent(current, excelData, isHGrid);
            result = result && comparisonResult.areEqual;
            if (!comparisonResult.areEqual) {
                differences = differences + comparisonResult.differences;
            }
        }

        return { areEqual: result, differences };
    }

    /* Returns file's name based on its type. */
    private getFileNameByType(type: ExcelFileTypes) {
        const file = ZipFiles.files.find((f) => f.type === type);
        return (file !== undefined) ? file.name : '';
    }

    /* Returns file's type based on its name. */
    private getFileTypeByName(name: string) {
        const file = ZipFiles.files.find((f) => f.name === name);
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
