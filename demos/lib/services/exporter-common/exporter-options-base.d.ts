export declare abstract class IgxExporterOptionsBase {
    protected _fileExtension: string;
    private _fileName;
    ignoreColumnsVisibility: boolean;
    ignoreFiltering: boolean;
    ignoreColumnsOrder: boolean;
    ignoreSorting: boolean;
    constructor(fileName: string, _fileExtension: string);
    private setFileName(fileName);
    fileName: string;
}
