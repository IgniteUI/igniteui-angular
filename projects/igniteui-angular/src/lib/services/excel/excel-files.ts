import { IExcelFile } from './excel-interfaces';
import { ExcelStrings } from './excel-strings';
import { WorksheetData } from './worksheet-data';

import * as JSZip from 'jszip';
import { yieldingLoop } from '../../core/utils';

/**
 * @hidden
 */
export class RootRelsFile implements IExcelFile {
    public writeElement(folder: JSZip) {
        folder.file('.rels', ExcelStrings.getRels());
    }
}

/**
 * @hidden
 */
export class AppFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        folder.file('app.xml', ExcelStrings.getApp(worksheetData.options.worksheetName));
    }
}

/**
 * @hidden
 */
export class CoreFile implements IExcelFile {
    public writeElement(folder: JSZip) {
        folder.file('core.xml', ExcelStrings.getCore());
    }
}

/**
 * @hidden
 */
export class WorkbookRelsFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        const hasSharedStrings = worksheetData.isEmpty === false;
        folder.file('workbook.xml.rels', ExcelStrings.getWorkbookRels(hasSharedStrings));
    }
}

/**
 * @hidden
 */
export class ThemeFile implements IExcelFile {
    public writeElement(folder: JSZip) {
        folder.file('theme1.xml', ExcelStrings.getTheme());
    }
}

/**
 * @hidden
 */
export class WorksheetFile implements IExcelFile {
    private static MIN_WIDTH = 8.43;
    private maxOutlineLevel = 0;
    private dimension = '';
    private freezePane = '';
    private rowHeight = '';
    private rowIndex = 0;

    public writeElement() {}

    public async writeElementAsync(folder: JSZip, worksheetData: WorksheetData) {
        return new Promise<void>(resolve => {
            this.prepareDataAsync(worksheetData, (cols, rows) => {
                const hasTable = !worksheetData.isEmpty && worksheetData.options.exportAsTable;

                folder.file('sheet1.xml', ExcelStrings.getSheetXML(
                    this.dimension, this.freezePane, cols, rows, hasTable, this.maxOutlineLevel));
                resolve();
            });
        });
    }

    private prepareDataAsync(worksheetData: WorksheetData, done: (cols: string, sheetData: string) => void) {
        let sheetData = '';
        let cols = '';
        const dictionary = worksheetData.dataDictionary;
        this.rowIndex = 0;

        if (worksheetData.isEmpty) {
            sheetData += '<sheetData/>';
            this.dimension = 'A1';
            done('', sheetData);
        } else {
            const owner = worksheetData.owner;
            sheetData += '<sheetData>';
            const height =  worksheetData.options.rowHeight;
            this.rowHeight = height ? ' ht="' + height + '" customHeight="1"' : '';

            this.rowIndex++;
            sheetData += `<row r="1"${this.rowHeight}>`;

            owner.columns.filter(c => !c.skip).forEach((currentCol, index) => {
                const columnCoordinate = ExcelStrings.getExcelColumn(index) + this.rowIndex;
                const columnValue = dictionary.saveValue(currentCol.header, index, true);
                sheetData += `<c r="${columnCoordinate}" t="s"><v>${columnValue}</v></c>`;
            });

            sheetData += '</row>';

            this.dimension = 'A1:' + ExcelStrings.getExcelColumn(worksheetData.columnCount - 1) + worksheetData.rowCount;
            cols += '<cols>';

            for (let i = 0; i < worksheetData.columnCount; i++) {
                const width = dictionary.columnWidths[i];
                // Use the width provided in the options if it exists
                let widthInTwips = worksheetData.options.columnWidth !== undefined ?
                                        worksheetData.options.columnWidth :
                                        Math.max(((width / 96) * 14.4), WorksheetFile.MIN_WIDTH);
                if (!(widthInTwips > 0)) {
                    widthInTwips = WorksheetFile.MIN_WIDTH;
                }

                cols += `<col min="${(i + 1)}" max="${(i + 1)}" width="${widthInTwips}" customWidth="1"/>`;
            }

            cols += '</cols>';

            if (worksheetData.indexOfLastPinnedColumn !== -1 &&
                !worksheetData.options.ignorePinning &&
                !worksheetData.options.ignoreColumnsOrder) {
                const frozenColumnCount = worksheetData.indexOfLastPinnedColumn + 1;
                const firstCell = ExcelStrings.getExcelColumn(frozenColumnCount) + '1';
                this.freezePane = `<pane xSplit="${frozenColumnCount}" topLeftCell="${firstCell}" activePane="topRight" state="frozen"/>`;
            }

            this.processDataRecordsAsync(worksheetData, (rows) => {
                sheetData += rows;
                sheetData += '</sheetData>';
                done(cols, sheetData);
            });
        }
    }

    private processDataRecordsAsync(worksheetData: WorksheetData, done: (rows: string) => void) {
        const rowDataArr = new Array(worksheetData.rowCount - 1);
        const height =  worksheetData.options.rowHeight;
        this.rowHeight = height ? ' ht="' + height + '" customHeight="1"' : '';

        const recordHeaders = worksheetData.owner.columns
                    .filter(c => !c.skip)
                    .map(c => c.field);

        yieldingLoop(worksheetData.rowCount - 1, 1000,
            (i) => {
                rowDataArr[i] = this.processRow(worksheetData, i + 1, recordHeaders);
            },
            () => {
                done(rowDataArr.join(''));
            });
    }

    private processRow(worksheetData: WorksheetData, i: number, headers: any[]) {
        const rowData = new Array(worksheetData.columnCount + 2);
        const record = worksheetData.data[i - 1];
        const sHidden = record.hidden ? ` hidden="1"` : '';
        const rowLevel = record.level;
        const outlineLevel = rowLevel > 0 ? ` outlineLevel="${rowLevel}"` : '';

        this.maxOutlineLevel = this.maxOutlineLevel < rowLevel ? rowLevel : this.maxOutlineLevel;

        rowData[0] = `<row r="${(i + 1)}"${this.rowHeight}${outlineLevel}${sHidden}>`;

        const keys = worksheetData.isSpecialData ? [record.data] : headers;

        for (let j = 0; j < keys.length; j++) {
            const cellData = WorksheetFile.getCellData(worksheetData, i, j, keys[j]);
            rowData[j + 1] = cellData;
        }

        rowData[worksheetData.columnCount + 1] = '</row>';

        return rowData.join('');
    }

    /* eslint-disable  @typescript-eslint/member-ordering */
    private static getCellData(worksheetData: WorksheetData, row: number, column: number, key: string): string {
        const dictionary = worksheetData.dataDictionary;
        const columnName = ExcelStrings.getExcelColumn(column) + (row + 1);
        const fullRow = worksheetData.data[row - 1];

        const cellValue = worksheetData.isSpecialData ?
            fullRow.data :
            fullRow.data[key];

        if (cellValue === undefined || cellValue === null) {
            return `<c r="${columnName}" s="1"/>`;
        } else {
            const savedValue = dictionary.saveValue(cellValue, column, false);
            const isSavedAsString = savedValue !== -1;

            const isSavedAsDate = !isSavedAsString && cellValue instanceof Date;

            let value = isSavedAsString ? savedValue : cellValue;

            if (isSavedAsDate) {
                const timeZoneOffset = value.getTimezoneOffset() * 60000;
                const isoString = (new Date(value - timeZoneOffset)).toISOString();
                value = isoString.substring(0, isoString.indexOf('.'));
            }

            const type = isSavedAsString ? ` t="s"` : isSavedAsDate ? ` t="d"` : '';

            const format = isSavedAsString ? '' : isSavedAsDate ? ` s="2"` : ` s="1"`;

            return `<c r="${columnName}"${type}${format}><v>${value}</v></c>`;
        }
    }
    /* eslint-enable  @typescript-eslint/member-ordering */
}

/**
 * @hidden
 */
export class StyleFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        const hasNumberValues = worksheetData.dataDictionary && worksheetData.dataDictionary.hasNumberValues;
        const hasDateValues = worksheetData.dataDictionary && worksheetData.dataDictionary.hasDateValues;
        folder.file('styles.xml', ExcelStrings.getStyles(hasNumberValues, hasDateValues));
    }
}

/**
 * @hidden
 */
export class WorkbookFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        folder.file('workbook.xml', ExcelStrings.getWorkbook(worksheetData.options.worksheetName));
    }
}

/**
 * @hidden
 */
export class ContentTypesFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        folder.file('[Content_Types].xml', ExcelStrings.getContentTypesXML(!worksheetData.isEmpty, worksheetData.options.exportAsTable));
    }
}

/**
 * @hidden
 */
export class SharedStringsFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        const dict = worksheetData.dataDictionary;
        const sortedValues = dict.getKeys();
        const sharedStrings = new Array<string>(sortedValues.length);

        for (const value of sortedValues) {
            sharedStrings[dict.getSanitizedValue(value)] = '<si><t>' + value + '</t></si>';
        }

        folder.file('sharedStrings.xml', ExcelStrings.getSharedStringXML(
                        dict.stringsCount,
                        sortedValues.length,
                        sharedStrings.join(''))
                    );
    }
}

/**
 * @hidden
 */
export class TablesFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        const columnCount = worksheetData.columnCount;
        const lastColumn = ExcelStrings.getExcelColumn(columnCount - 1) + worksheetData.rowCount;
        const dimension = 'A1:' + lastColumn;
        const values = worksheetData.owner.columns
                            .filter(c => !c.skip)
                            .map(c => c.header);

        let sortString = '';

        let tableColumns = '<tableColumns count="' + columnCount + '">';
        for (let i = 0; i < columnCount; i++) {
            const value =  values[i];
            tableColumns += '<tableColumn id="' + (i + 1) + '" name="' + value + '"/>';
        }

        tableColumns += '</tableColumns>';

        if (worksheetData.sort) {
            const sortingExpression = worksheetData.sort;
            const sc = ExcelStrings.getExcelColumn(values.indexOf(sortingExpression.fieldName));
            const dir = sortingExpression.dir - 1;
            sortString = `<sortState ref="A2:${lastColumn}"><sortCondition descending="${dir}" ref="${sc}1:${sc}15"/></sortState>`;
        }

        folder.file('table1.xml', ExcelStrings.getTablesXML(dimension, tableColumns, sortString));
    }
}

/**
 * @hidden
 */
export class WorksheetRelsFile implements IExcelFile {
    public writeElement(folder: JSZip) {
        folder.file('sheet1.xml.rels', ExcelStrings.getWorksheetRels());
    }
}
