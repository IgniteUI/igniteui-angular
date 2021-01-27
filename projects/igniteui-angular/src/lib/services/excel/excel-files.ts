import { IExcelFile } from './excel-interfaces';
import { ExcelStrings } from './excel-strings';
import { WorksheetData } from './worksheet-data';

import * as JSZip from 'jszip';
import { yieldingLoop } from '../../core/utils';

/**
 * @hidden
 */
export class RootRelsFile implements IExcelFile {
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
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
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
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
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
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

    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        const sheetData = [];
        const cols = [];
        let dimension: string;
        const dictionary = worksheetData.dataDictionary;
        let freezePane = '';
        let maxOutlineLevel = 0;

        if (worksheetData.isEmpty) {
            sheetData.push('<sheetData/>');
            dimension = 'A1';
        } else {
            sheetData.push('<sheetData>');
            const height =  worksheetData.options.rowHeight;
            const rowHeight = height ? ' ht="' + height + '" customHeight="1"' : '';

            sheetData.push(`<row r="1"${rowHeight}>`);
            for (let i = 0; i < worksheetData.columnCount; i++) {
                const column = ExcelStrings.getExcelColumn(i) + 1;
                const value = dictionary.saveValue(worksheetData.keys[i], i, true);
                sheetData.push(`<c r="${column}" t="s"><v>${value}</v></c>`);
            }
            sheetData.push('</row>');

            for (let i = 1; i < worksheetData.rowCount; i++) {
                if (!worksheetData.isTreeGridData) {
                    sheetData.push(`<row r="${(i + 1)}"${rowHeight}>`);
                } else {
                    const rowData = worksheetData.data[i - 1].originalRowData;
                    const sCollapsed = (!rowData.expanded) ? '' : (rowData.expanded === true) ? '' : ` collapsed="1"`;
                    const sHidden = (rowData.parent && this.hasCollapsedParent(rowData)) ? ` hidden="1"` : '';
                    const rowOutlineLevel = rowData.level ? rowData.level : 0;
                    const sOutlineLevel = rowOutlineLevel > 0 ? ` outlineLevel="${rowOutlineLevel}"` : '';
                    maxOutlineLevel = maxOutlineLevel < rowOutlineLevel ? rowOutlineLevel : maxOutlineLevel;

                    sheetData.push(`<row r="${(i + 1)}"${rowHeight}${sOutlineLevel}${sCollapsed}${sHidden}>`);
                }
                for (let j = 0; j < worksheetData.columnCount; j++) {
                    const cellData = WorksheetFile.getCellData(worksheetData, i, j);
                    sheetData.push(cellData);
                }
                sheetData.push('</row>');
            }
            sheetData.push('</sheetData>');
            dimension = 'A1:' + ExcelStrings.getExcelColumn(worksheetData.columnCount - 1) + worksheetData.rowCount;

            cols.push('<cols>');

            for (let i = 0; i < worksheetData.columnCount; i++) {
                const width = dictionary.columnWidths[i];
                // Use the width provided in the options if it exists
                let widthInTwips = worksheetData.options.columnWidth !== undefined ?
                                        worksheetData.options.columnWidth :
                                        Math.max(((width / 96) * 14.4), WorksheetFile.MIN_WIDTH);
                if (!(widthInTwips > 0)) {
                    widthInTwips = WorksheetFile.MIN_WIDTH;
                }

                cols.push(`<col min="${(i + 1)}" max="${(i + 1)}" width="${widthInTwips}" customWidth="1"/>`);
            }

            cols.push('</cols>');

            if (worksheetData.indexOfLastPinnedColumn !== -1 &&
                !worksheetData.options.ignorePinning &&
                !worksheetData.options.ignoreColumnsOrder) {
                const frozenColumnCount = worksheetData.indexOfLastPinnedColumn + 1;
                const firstCell = ExcelStrings.getExcelColumn(frozenColumnCount) + '1';
                freezePane = `<pane xSplit="${frozenColumnCount}" topLeftCell="${firstCell}" activePane="topRight" state="frozen"/>`;
            }
        }
        const hasTable = !worksheetData.isEmpty && worksheetData.options.exportAsTable;

        folder.file('sheet1.xml',
                    ExcelStrings.getSheetXML(dimension, freezePane, cols.join(''), sheetData.join(''), hasTable,
                    worksheetData.isTreeGridData, maxOutlineLevel));
    }

    public async writeElementAsync(folder: JSZip, worksheetData: WorksheetData) {
        return new Promise(resolve => {
            this.prepareDataAsync(worksheetData, (cols, rows) => {
                const hasTable = !worksheetData.isEmpty && worksheetData.options.exportAsTable;

                folder.file('sheet1.xml', ExcelStrings.getSheetXML(
                    this.dimension, this.freezePane, cols, rows, hasTable, worksheetData.isTreeGridData, this.maxOutlineLevel));
                resolve();
            });
        });
    }

    private prepareDataAsync(worksheetData: WorksheetData, done: (cols: string, sheetData: string) => void) {
        let sheetData = '';
        let cols = '';
        const dictionary = worksheetData.dataDictionary;

        if (worksheetData.isEmpty) {
            sheetData += '<sheetData/>';
            this.dimension = 'A1';
            done('', sheetData);
        } else {
            sheetData += '<sheetData>';
            const height =  worksheetData.options.rowHeight;
            this.rowHeight = height ? ' ht="' + height + '" customHeight="1"' : '';
            sheetData += `<row r="1"${this.rowHeight}>`;

            for (let i = 0; i < worksheetData.columnCount; i++) {
                const column = ExcelStrings.getExcelColumn(i) + 1;
                const value = dictionary.saveValue(worksheetData.keys[i], i, true);
                sheetData += `<c r="${column}" t="s"><v>${value}</v></c>`;
            }
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

        yieldingLoop(worksheetData.rowCount - 1, 1000,
            (i) => {
                rowDataArr[i] = this.processRow(worksheetData, i + 1);
            },
            () => {
                done(rowDataArr.join(''));
            });
    }

    private processRow(worksheetData: WorksheetData, i: number) {
        const rowData = new Array(worksheetData.columnCount + 2);
        if (!worksheetData.isTreeGridData) {
            rowData[0] = `<row r="${(i + 1)}"${this.rowHeight}>`;
        } else {
            const originalData = worksheetData.data[i - 1].originalRowData;
            const sCollapsed = (!originalData.expanded) ? '' : (originalData.expanded === true) ? '' : ` collapsed="1"`;
            const sHidden = (originalData.parent && this.hasCollapsedParent(originalData)) ? ` hidden="1"` : '';
            const rowOutlineLevel = originalData.level ? originalData.level : 0;
            const sOutlineLevel = rowOutlineLevel > 0 ? ` outlineLevel="${rowOutlineLevel}"` : '';
            this.maxOutlineLevel = this.maxOutlineLevel < rowOutlineLevel ? rowOutlineLevel : this.maxOutlineLevel;
            rowData[0] = `<row r="${(i + 1)}"${this.rowHeight}${sOutlineLevel}${sCollapsed}${sHidden}>`;
        }

        for (let j = 0; j < worksheetData.columnCount; j++) {
            const cellData = WorksheetFile.getCellData(worksheetData, i, j);
            rowData[j + 1] = cellData;
        }
        rowData[worksheetData.columnCount + 1] = '</row>';

        return rowData.join('');
    }

    private hasCollapsedParent(rowData) {
        let result = !rowData.parent.expanded;
        while (rowData.parent) {
            result = result || !rowData.parent.expanded;
            rowData = rowData.parent;
        }

        return result;
    }
    /* eslint-disable  @typescript-eslint/member-ordering */
    private static getCellData(worksheetData: WorksheetData, row: number, column: number): string {
        const dictionary = worksheetData.dataDictionary;
        const columnName = ExcelStrings.getExcelColumn(column) + (row + 1);
        const columnHeader = worksheetData.keys[column];

        const rowData = worksheetData.data[row - 1].rowData;

        const cellValue = worksheetData.isSpecialData ? rowData : rowData[columnHeader];

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
        const values = worksheetData.keys;
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
    public writeElement(folder: JSZip, worksheetData: WorksheetData) {
        folder.file('sheet1.xml.rels', ExcelStrings.getWorksheetRels());
    }
}
