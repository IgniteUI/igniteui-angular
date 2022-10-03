import { IExcelFile } from './excel-interfaces';
import { ExcelStrings } from './excel-strings';
import { WorksheetData } from './worksheet-data';

import { strToU8 } from 'fflate';
import { yieldingLoop } from '../../core/utils';
import { HeaderType, ExportRecordType, IExportRecord, IColumnList, IColumnInfo } from '../exporter-common/base-export-service';
import { WorksheetDataDictionary } from './worksheet-data-dictionary';

/**
 * @hidden
 */
export class RootRelsFile implements IExcelFile {
    public writeElement(folder: Object) {
        folder['.rels'] = strToU8(ExcelStrings.getRels());
    }
}

/**
 * @hidden
 */
export class AppFile implements IExcelFile {
    public writeElement(folder: Object, worksheetData: WorksheetData) {
        folder['app.xml'] = strToU8(ExcelStrings.getApp(worksheetData.options.worksheetName));
    }
}

/**
 * @hidden
 */
export class CoreFile implements IExcelFile {
    public writeElement(folder: Object) {
        folder['core.xml'] = strToU8(ExcelStrings.getCore());
    }
}

/**
 * @hidden
 */
export class WorkbookRelsFile implements IExcelFile {
    public writeElement(folder: Object, worksheetData: WorksheetData) {
        const hasSharedStrings = !worksheetData.isEmpty || worksheetData.options.alwaysExportHeaders;
        folder['workbook.xml.rels'] = strToU8(ExcelStrings.getWorkbookRels(hasSharedStrings));
    }
}

/**
 * @hidden
 */
export class ThemeFile implements IExcelFile {
    public writeElement(folder: Object) {
        folder['theme1.xml'] = strToU8(ExcelStrings.getTheme());
    }
}

/**
 * @hidden
 */
export class WorksheetFile implements IExcelFile {
    private static MIN_WIDTH = 8.43;
    private maxOutlineLevel = 0;
    private sheetData = '';
    private dimension = '';
    private freezePane = '';
    private rowHeight = '';

    private mergeCellStr = '';
    private mergeCellsCounter = 0;
    private rowIndex = 0;
    private pivotGridRowHeadersMap = new Map<number, string>();

    public writeElement() {}

    public async writeElementAsync(folder: Object, worksheetData: WorksheetData) {
        return new Promise<void>(resolve => {
            this.prepareDataAsync(worksheetData, (cols, rows) => {
                const hasTable = (!worksheetData.isEmpty || worksheetData.options.alwaysExportHeaders)
                    && worksheetData.options.exportAsTable;

                folder['sheet1.xml'] = strToU8(ExcelStrings.getSheetXML(
                    this.dimension, this.freezePane, cols, rows, hasTable, this.maxOutlineLevel, worksheetData.isHierarchical));
                resolve();
            });
        });
    }

    private prepareDataAsync(worksheetData: WorksheetData, done: (cols: string, sheetData: string) => void) {
        this.sheetData = '';
        let cols = '';
        const dictionary = worksheetData.dataDictionary;
        this.rowIndex = 0;

        if (worksheetData.isEmpty && (!worksheetData.options.alwaysExportHeaders || worksheetData.owner.columns.length === 0)) {
            this.sheetData += '<sheetData/>';
            this.dimension = 'A1';
            done('', this.sheetData);
        } else {
            const owner = worksheetData.owner;
            const isHierarchicalGrid = worksheetData.isHierarchical;
            const hasMultiColumnHeader = worksheetData.hasMultiColumnHeader;
            const hasMultiRowHeader = worksheetData.hasMultiRowHeader;

            const hasUserSetIndex = owner.columns.some(col => col.exportIndex !== undefined);

            const height =  worksheetData.options.rowHeight;
            this.rowHeight = height ? ` ht="${height}" customHeight="1"` : '';
            this.sheetData += `<sheetData>`;

            let headersForLevel: IColumnInfo[] = [];

            for(let i = 0; i <= owner.maxRowLevel; i++) {
                headersForLevel =  owner.columns.filter(c => c.level === i && c.rowSpan > 0 && !c.skip)

                this.printHeaders(worksheetData, headersForLevel, i, true);

                this.rowIndex++;
            }

            this.rowIndex = 0;

            for (let i = 0; i <= owner.maxLevel; i++) {
                this.rowIndex++;
                const pivotGridColumns = this.pivotGridRowHeadersMap.get(this.rowIndex) ?? "";
                this.sheetData += `<row r="${this.rowIndex}"${this.rowHeight}>${pivotGridColumns}`;

                const allowedColumns = owner.columns.filter(c => c.headerType !== HeaderType.RowHeader && c.headerType !== HeaderType.MultiRowHeader);

                headersForLevel = hasMultiColumnHeader ?
                    allowedColumns
                        .filter(c => (c.level < i &&
                            c.headerType !== HeaderType.MultiColumnHeader || c.level === i) && c.columnSpan > 0 && !c.skip)
                        .sort((a, b) => a.startIndex - b.startIndex)
                        .sort((a, b) => a.pinnedIndex - b.pinnedIndex) :
                    hasUserSetIndex ?
                        allowedColumns.filter(c => !c.skip) :
                        allowedColumns.filter(c => !c.skip)
                            .sort((a, b) => a.startIndex - b.startIndex)
                            .sort((a, b) => a.pinnedIndex - b.pinnedIndex);

                this.printHeaders(worksheetData, headersForLevel, i, false);

                this.sheetData += `</row>`;
            }

            const multiColumnHeaderLevel = worksheetData.options.ignoreMultiColumnHeaders ? 0 : owner.maxLevel;
            const freezeHeaders = worksheetData.options.freezeHeaders ? 2 + multiColumnHeaderLevel : 1;

            if (!isHierarchicalGrid) {
                this.dimension =
                    'A1:' + ExcelStrings.getExcelColumn(worksheetData.columnCount - 1) + (worksheetData.rowCount);

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
                const frozenColumnCount = indexOfLastPinnedColumn + 1;
                let firstCell = ExcelStrings.getExcelColumn(frozenColumnCount) + freezeHeaders;
                if (indexOfLastPinnedColumn !== undefined && indexOfLastPinnedColumn !== -1 &&
                    !worksheetData.options.ignorePinning &&
                    !worksheetData.options.ignoreColumnsOrder) {
                    this.freezePane =
                        `<pane xSplit="${frozenColumnCount}" ySplit="${freezeHeaders - 1}"
                         topLeftCell="${firstCell}" activePane="topRight" state="frozen"/>`;
                } else if (worksheetData.options.freezeHeaders) {
                    firstCell = ExcelStrings.getExcelColumn(0) + freezeHeaders;
                    this.freezePane =
                        `<pane xSplit="0" ySplit="${freezeHeaders - 1}"
                         topLeftCell="${firstCell}" activePane="topRight" state="frozen"/>`;
                }
            } else {
                const columnWidth = worksheetData.options.columnWidth ? worksheetData.options.columnWidth : 20;
                cols += `<cols><col min="1" max="${worksheetData.columnCount}" width="${columnWidth}" customWidth="1"/></cols>`;
                if (worksheetData.options.freezeHeaders) {
                    const firstCell = ExcelStrings.getExcelColumn(0) + freezeHeaders;
                    this.freezePane =
                        `<pane xSplit="0" ySplit="${freezeHeaders - 1}"
                         topLeftCell="${firstCell}" activePane="topRight" state="frozen"/>`;
                }
            }

            this.processDataRecordsAsync(worksheetData, (rows) => {
                this.sheetData += rows;
                this.sheetData += '</sheetData>';

                if ((hasMultiColumnHeader || hasMultiRowHeader) && this.mergeCellsCounter > 0) {
                    this.sheetData += `<mergeCells count="${this.mergeCellsCounter}">${this.mergeCellStr}</mergeCells>`;
                }

                done(cols, this.sheetData);
            });
        }
    }

    private processDataRecordsAsync(worksheetData: WorksheetData, done: (rows: string) => void) {
        const rowDataArr = [];
        const height =  worksheetData.options.rowHeight;
        this.rowHeight = height ? ' ht="' + height + '" customHeight="1"' : '';

        const isHierarchicalGrid = worksheetData.isHierarchical;
        const hasUserSetIndex = worksheetData.owner.columns.some(c => c.exportIndex !== undefined);

        let recordHeaders = [];

        yieldingLoop(worksheetData.rowCount - worksheetData.multiColumnHeaderRows - 1, 1000,
            (i) => {
                if (!worksheetData.isEmpty){
                    if (!isHierarchicalGrid) {
                        if (hasUserSetIndex) {
                            recordHeaders = worksheetData.rootKeys;
                        } else {
                            recordHeaders = worksheetData.owner.columns
                                .filter(c => c.headerType !== HeaderType.MultiColumnHeader && c.headerType !== HeaderType.MultiRowHeader && c.headerType !== HeaderType.RowHeader && !c.skip)
                                .sort((a, b) => a.startIndex-b.startIndex)
                                .sort((a, b) => a.pinnedIndex-b.pinnedIndex)
                                .map(c => c.field);
                        }
                    } else {
                        const record = worksheetData.data[i];

                        if (record.type === ExportRecordType.HeaderRecord) {
                            const recordOwner = worksheetData.owners.get(record.owner);
                            const hasMultiColumnHeaders = recordOwner.columns.some(c => !c.skip && c.headerType === HeaderType.MultiColumnHeader);

                            if (hasMultiColumnHeaders) {
                                this.hGridPrintMultiColHeaders(worksheetData, rowDataArr, record, recordOwner);
                            }
                        }

                        recordHeaders = Object.keys(worksheetData.data[i].data);
                    }

                    rowDataArr.push(this.processRow(worksheetData, i, recordHeaders, isHierarchicalGrid));
                }
            },
            () => {
                done(rowDataArr.join(''));
        });
    }

    private hGridPrintMultiColHeaders(worksheetData: WorksheetData, rowDataArr: any[], record: IExportRecord,
        owner: IColumnList) {
        for (let j = 0; j < owner.maxLevel; j++) {
            const recordLevel = record.level;
            const outlineLevel = recordLevel > 0 ? ` outlineLevel="${recordLevel}"` : '';
            this.maxOutlineLevel = this.maxOutlineLevel < recordLevel ? recordLevel : this.maxOutlineLevel;
            const sHidden = record.hidden ? ` hidden="1"` : '';

            this.rowIndex++;
            let row = `<row r="${this.rowIndex}"${this.rowHeight}${outlineLevel}${sHidden}>`;

            const headersForLevel = owner.columns
                .filter(c => (c.level < j &&
                    c.headerType !== HeaderType.MultiColumnHeader || c.level === j) && c.columnSpan > 0 && !c.skip)
                .sort((a, b) => a.startIndex - b.startIndex)
                .sort((a, b) => a.pinnedIndex - b.pinnedIndex);

            let startValue = 0 + record.level;

            for (const currentCol of headersForLevel) {
                if (currentCol.level === j) {
                    let columnCoordinate;
                    columnCoordinate =
                        ExcelStrings.getExcelColumn(startValue) + this.rowIndex;

                    const columnValue = worksheetData.dataDictionary.saveValue(currentCol.header, true);
                    row += `<c r="${columnCoordinate}" s="3" t="s"><v>${columnValue}</v></c>`;

                    if (j !== owner.maxLevel) {
                        this.mergeCellsCounter++;
                        this.mergeCellStr += ` <mergeCell ref="${columnCoordinate}:`;

                        if (currentCol.headerType === HeaderType.ColumnHeader) {
                            columnCoordinate = ExcelStrings.getExcelColumn(startValue) +
                                (this.rowIndex + owner.maxLevel - currentCol.level);
                        } else {
                            for (let k = 1; k < currentCol.columnSpan; k++) {
                                columnCoordinate = ExcelStrings.getExcelColumn(startValue + k) + this.rowIndex;
                                row += `<c r="${columnCoordinate}" s="3" />`;
                            }
                        }

                        this.mergeCellStr += `${columnCoordinate}" />`;
                    }
                }

                startValue += currentCol.columnSpan;
            }
            row += `</row>`;
            rowDataArr.push(row);
        }
    }

    private processRow(worksheetData: WorksheetData, i: number, headersForLevel: any[], isHierarchicalGrid: boolean) {
        const record = worksheetData.data[i];

        const rowData = new Array(worksheetData.columnCount + 2);

        const rowLevel = record.level;
        const outlineLevel = rowLevel > 0 ? ` outlineLevel="${rowLevel}"` : '';
        this.maxOutlineLevel = this.maxOutlineLevel < rowLevel ? rowLevel : this.maxOutlineLevel;

        const sHidden = record.hidden ? ` hidden="1"` : '';

        this.rowIndex++;
        const pivotGridColumns = this.pivotGridRowHeadersMap.get(this.rowIndex) ?? "";

        rowData[0] =
            `<row r="${this.rowIndex}"${this.rowHeight}${outlineLevel}${sHidden}>${pivotGridColumns}`;

        const keys = worksheetData.isSpecialData ? [record.data] : headersForLevel;

        for (let j = 0; j < keys.length; j++) {
            const col = j + (isHierarchicalGrid ? rowLevel : worksheetData.isPivotGrid ? worksheetData.owner.maxRowLevel : 0);

            const cellData = this.getCellData(worksheetData, i, col, keys[j]);

            rowData[j + 1] = cellData;
        }

        rowData[keys.length + 1] = '</row>';

        return rowData.join('');
    }

    private getCellData(worksheetData: WorksheetData, row: number, column: number, key: string): string {
        const dictionary = worksheetData.dataDictionary;
        const columnName = ExcelStrings.getExcelColumn(column) + (this.rowIndex);
        const fullRow = worksheetData.data[row];
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

    private printHeaders(worksheetData: WorksheetData, headersForLevel: IColumnInfo[], i: number, isVertical: boolean) {
        let startValue = 0;
        let str = '';

        const isHierarchicalGrid = worksheetData.isHierarchical;
        let rowStyle = isHierarchicalGrid ? ' s="3"' : '';
        const dictionary = worksheetData.dataDictionary;
        const owner = worksheetData.owner;
        const maxLevel = isVertical
            ? owner.maxRowLevel
            : owner.maxLevel;

        for (const currentCol of headersForLevel) {
            const spanLength = isVertical ? currentCol.rowSpan : currentCol.columnSpan;

            if (currentCol.level === i) {
                let columnCoordinate;
                const column = isVertical
                    ? this.rowIndex
                    : startValue + (owner.maxRowLevel ?? 0)

                const rowCoordinate = isVertical
                    ? startValue + owner.maxLevel + 2
                    : this.rowIndex

                const columnValue = dictionary.saveValue(currentCol.header, true);

                columnCoordinate = ExcelStrings.getExcelColumn(column) + rowCoordinate;
                rowStyle = isVertical && currentCol.rowSpan > 1 ? ' s="4"' : rowStyle;
                str = `<c r="${columnCoordinate}"${rowStyle} t="s"><v>${columnValue}</v></c>`;

                if (isVertical) {
                    if (this.pivotGridRowHeadersMap.has(rowCoordinate)) {
                        this.pivotGridRowHeadersMap.set(rowCoordinate, this.pivotGridRowHeadersMap.get(rowCoordinate) + str)
                    } else {
                        this.pivotGridRowHeadersMap.set(rowCoordinate, str)
                    }
                } else {
                    this.sheetData += str;
                }

                if (i !== maxLevel) {
                    this.mergeCellsCounter++;
                    this.mergeCellStr += ` <mergeCell ref="${columnCoordinate}:`;

                    if (currentCol.headerType === HeaderType.ColumnHeader) {
                        const col = isVertical
                            ? maxLevel
                            : startValue + (owner.maxRowLevel ?? 0);

                        const row = isVertical
                            ? rowCoordinate
                            : owner.maxLevel + 1;

                        columnCoordinate = ExcelStrings.getExcelColumn(col) + row;
                    } else {
                        for (let k = 1; k < spanLength; k++) {
                            const col = isVertical
                                ? column
                                : column + k;

                            const row = isVertical
                                ? rowCoordinate + k
                                : this.rowIndex;

                            columnCoordinate = ExcelStrings.getExcelColumn(col) + row;
                            str = `<c r="${columnCoordinate}"${rowStyle} />`;

                            isVertical
                                ? this.pivotGridRowHeadersMap.set(row, str)
                                : this.sheetData += str
                        }
                    }

                    this.mergeCellStr += `${columnCoordinate}" />`;
                }
            }

            startValue += spanLength;
        }
    }
}

/**
 * @hidden
 */
export class StyleFile implements IExcelFile {
    public writeElement(folder: Object) {
        folder['styles.xml'] = strToU8(ExcelStrings.getStyles());
    }
}

/**
 * @hidden
 */
export class WorkbookFile implements IExcelFile {
    public writeElement(folder: Object, worksheetData: WorksheetData) {
        folder['workbook.xml'] = strToU8(ExcelStrings.getWorkbook(worksheetData.options.worksheetName));
    }
}

/**
 * @hidden
 */
export class ContentTypesFile implements IExcelFile {
    public writeElement(folder: Object, worksheetData: WorksheetData) {
        const hasSharedStrings = !worksheetData.isEmpty || worksheetData.options.alwaysExportHeaders;
        folder['[Content_Types].xml'] = strToU8(ExcelStrings.getContentTypesXML(hasSharedStrings, worksheetData.options.exportAsTable));
    }
}

/**
 * @hidden
 */
export class SharedStringsFile implements IExcelFile {
    public writeElement(folder: Object, worksheetData: WorksheetData) {
        const dict = worksheetData.dataDictionary;
        const sortedValues = dict.getKeys();
        const sharedStrings = new Array<string>(sortedValues.length);

        for (const value of sortedValues) {
            sharedStrings[dict.getSanitizedValue(value)] = '<si><t>' + value + '</t></si>';
        }

        folder['sharedStrings.xml'] = strToU8(ExcelStrings.getSharedStringXML(
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
    public writeElement(folder: Object, worksheetData: WorksheetData) {
        const columnCount = worksheetData.columnCount;
        const lastColumn = ExcelStrings.getExcelColumn(columnCount - 1) + worksheetData.rowCount;
        const autoFilterDimension = 'A1:' + lastColumn;
        const tableDimension = worksheetData.isEmpty
            ? 'A1:' + ExcelStrings.getExcelColumn(columnCount - 1) + (worksheetData.rowCount + 1)
            : autoFilterDimension;
        const hasUserSetIndex = worksheetData.owner.columns.some(c => c.exportIndex !== undefined);
        const values = hasUserSetIndex
            ? worksheetData.rootKeys
            : worksheetData.owner.columns
                .filter(c => !c.skip)
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

        folder['table1.xml'] = strToU8(ExcelStrings.getTablesXML(autoFilterDimension, tableDimension, tableColumns, sortString));
    }
}

/**
 * @hidden
 */
export class WorksheetRelsFile implements IExcelFile {
    public writeElement(folder: Object) {
        folder['sheet1.xml.rels'] = strToU8(ExcelStrings.getWorksheetRels());
    }
}
