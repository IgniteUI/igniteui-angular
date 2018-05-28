export declare class ExcelStrings {
    private static XML_STRING;
    private static SHARED_STRING_RELATIONSHIP;
    static getRels(): string;
    static getApp(): string;
    static getCore(): string;
    static getTheme(): string;
    static getStyles(hasNonStringValues: boolean): string;
    static getWorkbook(): string;
    static getWorksheetRels(): string;
    static getWorkbookRels(hasSharedStrings: any): string;
    static getSheetXML(dimension: string, freezePane: string, cols: string, sheetData: string, hasTable: boolean): string;
    static getSharedStringXML(count: number, uniqueCount: number, table: string): string;
    static getContentTypesXML(hasSharedStrings: boolean, hasTable: boolean): string;
    static getTablesXML(dimension: string, tableColumns: string, sort: string): string;
    static getExcelColumn(index: number): string;
}
