import { IExcelFile } from './excel-interfaces';
import { ExcelStrings } from './excel-strings';
import { WorksheetData } from './worksheet-data';

import * as JSZip from 'jszip';
import { yieldingLoop } from '../../core/utils';
import { HeaderType, ExportRecordType } from '../exporter-common/base-export-service';

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

    public writeElement() {}

    public async writeElementAsync(folder: JSZip, worksheetData: WorksheetData) {
        return new Promise<void>(resolve => {
            this.prepareDataNew(worksheetData, (cols, rows) => {
                const hasTable = !worksheetData.isEmpty && worksheetData.options.exportAsTable;
                const isHierarchicalGrid = worksheetData.data[0]?.type === ExportRecordType.HierarchicalGridRecord;

                folder.file('sheet1.xml', ExcelStrings.getSheetXML(
                    this.dimension, this.freezePane, cols, rows, hasTable, this.maxOutlineLevel, isHierarchicalGrid));
                resolve();
            });
        });
    }

    private prepareDataNew(worksheetData: WorksheetData, done: (cols: string, sheetData: string) => void) {
        let sheetData = '';
        let cols = '';
        const dictionary = worksheetData.dataDictionary;

        let mergeCellsCounter = 0;
        let mergeCellStr = '';

        if (worksheetData.isEmpty) {
            sheetData += '<sheetData/>';
            this.dimension = 'A1';
            done('', sheetData);
        } else {
            const owner = worksheetData.owner;
            const isHierarchicalGrid = worksheetData.data[0].type === ExportRecordType.HierarchicalGridRecord;
            const hasMultiColumnHeader = owner.columns.some(col => !col.skip && col.headerType === HeaderType.MultiColumnHeader);

            const height =  worksheetData.options.rowHeight;
            const rowStyle = isHierarchicalGrid ? ' s="3"' : '';
            this.rowHeight = height ? ` ht="${height}" customHeight="1"` : '';

            sheetData += `<sheetData>`;

            for (let i = 0; i <= owner.maxLevel; i++) {
                sheetData += `<row r="${i + 1}"${this.rowHeight}>`;

                const headersForLevel = hasMultiColumnHeader ?
                    owner.columns
                        .filter(c => (c.level < i &&
                            c.headerType !== HeaderType.MultiColumnHeader || c.level === i) && c.columnSpan > 0 && !c.skip)
                        .sort((a, b) => a.startIndex - b.startIndex)
                        .sort((a, b) => a.pinnedIndex - b.pinnedIndex) :
                    owner.columns.filter(c => !c.skip)
                        .sort((a, b) => a.startIndex - b.startIndex)
                        .sort((a, b) => a.pinnedIndex - b.pinnedIndex);

                let startValue = 0;

                for (const currentCol of headersForLevel) {
                    if (currentCol.level === i) {
                        let columnCoordinate;
                        columnCoordinate = ExcelStrings.getExcelColumn(startValue) + (i + 1);
                        const columnValue = dictionary.saveValue(currentCol.header, true);
                        sheetData += `<c r="${columnCoordinate}"${rowStyle} t="s"><v>${columnValue}</v></c>`;

                        if (i !== owner.maxLevel) {
                            mergeCellsCounter++;
                            mergeCellStr += ` <mergeCell ref="${columnCoordinate}:`;

                            if (currentCol.headerType === HeaderType.ColumnHeader) {
                                columnCoordinate = ExcelStrings.getExcelColumn(startValue) + (owner.maxLevel + 1);
                            } else {
                                for (let k = 1; k < currentCol.columnSpan; k++) {
                                    columnCoordinate = ExcelStrings.getExcelColumn(startValue + k) + (i + 1);
                                    sheetData += `<c r="${columnCoordinate}" />`;
                                }
                            }

                            mergeCellStr += `${columnCoordinate}" />`;
                        }
                    }

                    startValue += currentCol.columnSpan;
                }

                sheetData += `</row>`;
            }

            if (!isHierarchicalGrid) {
                this.dimension =
                    'A1:' + ExcelStrings.getExcelColumn(worksheetData.columnCount - 1) + (worksheetData.rowCount + owner.maxLevel);

                cols += '<cols>';

                if (!hasMultiColumnHeader) {
                    for (let j = 0; j < worksheetData.columnCount; j++) {
                        const width = dictionary.columnWidths[j];
                        // Use the width provided in the options if it exists
                        let widthInTwips = worksheetData.options.columnWidth !== undefined ?
                                                worksheetData.options.columnWidth :
                                                Math.max(((width / 96) * 14.4), WorksheetFile.MIN_WIDTH);
                        if (!(widthInTwips > 0)) {
                            widthInTwips = WorksheetFile.MIN_WIDTH;
                        }

                        cols += `<col min="${(j + 1)}" max="${(j + 1)}" width="${widthInTwips}" customWidth="1"/>`;
                    }
                } else {
                    cols += `<col min="1" max="${worksheetData.columnCount}" width="15" customWidth="1"/>`;
                }

                cols += '</cols>';

                const indexOfLastPinnedColumn = worksheetData.indexOfLastPinnedColumn;

                if (indexOfLastPinnedColumn !== -1 &&
                    !worksheetData.options.ignorePinning &&
                    !worksheetData.options.ignoreColumnsOrder) {
                    const frozenColumnCount = indexOfLastPinnedColumn + 1;
                    const firstCell = ExcelStrings.getExcelColumn(frozenColumnCount) + '1';
                    this.freezePane =
                        `<pane xSplit="${frozenColumnCount}" topLeftCell="${firstCell}" activePane="topRight" state="frozen"/>`;
                }
            } else {
                const columnWidth = worksheetData.options.columnWidth ? worksheetData.options.columnWidth : 20;
                cols += `<cols><col min="1" max="${worksheetData.columnCount}" width="${columnWidth}" customWidth="1"/></cols>`;
            }

            this.processDataRecordsAsync(worksheetData, (rows) => {
                sheetData += rows;
                sheetData += '</sheetData>';

                if (hasMultiColumnHeader) {
                    sheetData += `<mergeCells count="${mergeCellsCounter}">${mergeCellStr}</mergeCells>`;
                }

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
        const record = worksheetData.data[i - 1];
        const isHierarchicalGrid = record.type === ExportRecordType.HeaderRecord || record.type === ExportRecordType.HierarchicalGridRecord;

        let headersForLevel = [];
        if (!isHierarchicalGrid) {
            headersForLevel = worksheetData.owner.columns
                .filter(c => c.headerType !== HeaderType.MultiColumnHeader && !c.skip)
                .sort((a, b) => a.startIndex-b.startIndex)
                .sort((a, b) => a.pinnedIndex-b.pinnedIndex)
                .map(c => c.field);
        } else {
            headersForLevel = Object.keys(record.data);
        }

        const rowData = new Array(worksheetData.columnCount + 2);

        const rowLevel = record.level;
        const outlineLevel = rowLevel > 0 ? ` outlineLevel="${rowLevel}"` : '';
        this.maxOutlineLevel = this.maxOutlineLevel < rowLevel ? rowLevel : this.maxOutlineLevel;

        const sHidden = record.hidden ? ` hidden="1"` : '';

        rowData[0] = `<row r="${(i + 1 + worksheetData.owner.maxLevel)}"${this.rowHeight}${outlineLevel}${sHidden}>`;

        const keys = worksheetData.isSpecialData ? [record.data] : headersForLevel;

        for (let j = 0; j < keys.length; j++) {
            const col = j + (isHierarchicalGrid ? rowLevel : 0);

            const cellData = WorksheetFile.getCellData(worksheetData, i, col, keys[j]);

            rowData[j + 1] = cellData;
        }

        rowData[keys.length + 1] = '</row>';

        return rowData.join('');
    }

    /* eslint-disable  @typescript-eslint/member-ordering */
    private static getCellData(worksheetData: WorksheetData, row: number, column: number, key: string): string {
        const dictionary = worksheetData.dataDictionary;
        const columnName = ExcelStrings.getExcelColumn(column) + (row + 1 + worksheetData.owner.maxLevel);
        const fullRow = worksheetData.data[row - 1];
        const isHeaderRecord = fullRow.type === ExportRecordType.HeaderRecord;

        const cellValue = worksheetData.isSpecialData ?
            fullRow.data :
            fullRow.data[key];

        if (cellValue === undefined || cellValue === null) {
            return `<c r="${columnName}" s="1"/>`;
        } else {
            const savedValue = dictionary.saveValue(cellValue, isHeaderRecord);
            const isSavedAsString = savedValue !== -1;

            const isSavedAsDate = !isSavedAsString && cellValue instanceof Date;

            let value = isSavedAsString ? savedValue : cellValue;

            if (isSavedAsDate) {
                const timeZoneOffset = value.getTimezoneOffset() * 60000;
                const isoString = (new Date(value - timeZoneOffset)).toISOString();
                value = isoString.substring(0, isoString.indexOf('.'));
            }

            const type = isSavedAsString ? ` t="s"` : isSavedAsDate ? ` t="d"` : '';

            const format = isHeaderRecord ? ` s="3"` : isSavedAsString ? '' : isSavedAsDate ? ` s="2"` : ` s="1"`;

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
        const isHierarchicalGrid = worksheetData.data[0]?.type === ExportRecordType.HierarchicalGridRecord;

        folder.file('styles.xml', ExcelStrings.getStyles(hasNumberValues, hasDateValues, isHierarchicalGrid));
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
            .sort((a, b) => a.startIndex - b.startIndex)
            .sort((a, b) => a.pinnedIndex - b.pinnedIndex)
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
