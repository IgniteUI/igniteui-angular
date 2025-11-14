import { EventEmitter, Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { DEFAULT_OWNER, ExportHeaderType, ExportRecordType, GRID_LEVEL_COL, IExportRecord, IgxBaseExporter } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxPdfExporterOptions } from './pdf-exporter-options';
import { IBaseEventArgs } from '../../core/utils';

export interface IPdfExportEndedEventArgs extends IBaseEventArgs {
    pdf?: jsPDF;
}

/**
 * **Ignite UI for Angular PDF Exporter Service** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/exporter_pdf.html)
 *
 * The Ignite UI for Angular PDF Exporter service can export data in PDF format from both raw data
 * (array) or from an `IgxGrid`.
 *
 * Example:
 * ```typescript
 * public localData = [
 *   { Name: "Eric Ridley", Age: "26" },
 *   { Name: "Alanis Brook", Age: "22" },
 *   { Name: "Jonathan Morris", Age: "23" }
 * ];
 *
 * constructor(private pdfExportService: IgxPdfExporterService) {
 * }
 *
 * this.pdfExportService.exportData(this.localData, new IgxPdfExporterOptions("FileName"));
 * ```
 */
@Injectable({
    providedIn: 'root',
})
export class IgxPdfExporterService extends IgxBaseExporter {

    /**
     * This event is emitted when the export process finishes.
     * ```typescript
     * this.exporterService.exportEnded.subscribe((args: IPdfExportEndedEventArgs) => {
     * // put event handler code here
     * });
     * ```
     *
     * @memberof IgxPdfExporterService
     */
    public override exportEnded = new EventEmitter<IPdfExportEndedEventArgs>();

    protected exportDataImplementation(data: IExportRecord[], options: IgxPdfExporterOptions, done: () => void): void {
        const firstDataElement = data[0];
        const isHierarchicalGrid = firstDataElement?.type === ExportRecordType.HierarchicalGridRecord;
        const isPivotGrid = firstDataElement?.type === ExportRecordType.PivotGridRecord;

        const defaultOwner =  isHierarchicalGrid ?
            this._ownersMap.get(firstDataElement.owner) :
            this._ownersMap.get(DEFAULT_OWNER);

        // Get all columns (including multi-column headers)
        const allColumns = defaultOwner?.columns.filter(col => !col.skip) || [];

        // Extract pivot grid row dimension fields (these are in the data, rendered as row headers)
        // For pivot grids, the row dimension fields appear in each record's data
        const rowDimensionFields: string[] = [];
        const rowDimensionHeaders: string[] = [];
        if (isPivotGrid && defaultOwner) {
            // First, get PivotRowHeader columns - these are the dimension names (like "City", "ContactTitle")
            const pivotRowHeaders = allColumns.filter(col => col.headerType === ExportHeaderType.PivotRowHeader);

            // Get row dimension VALUE columns - these contain the actual data values
            const rowHeaderCols = allColumns.filter(col =>
                col.headerType === ExportHeaderType.RowHeader ||
                col.headerType === ExportHeaderType.MultiRowHeader ||
                col.headerType === ExportHeaderType.PivotMergedHeader
            );

            // Use PivotRowHeader names as column headers
            rowDimensionHeaders.push(...pivotRowHeaders.map(col => col.header || col.field).filter(h => h));

            // Extract the field names from VALUE columns - these are the keys in the record data
            rowDimensionFields.push(...rowHeaderCols.map(col => col.field).filter(f => f));
        }

        // Get leaf columns (actual data columns), excluding GRID_LEVEL_COL and row dimension fields
        // For pivot grids, we need to exclude row dimension fields since they're rendered separately
        const leafColumns = allColumns.filter(col => {
            if (col.field === GRID_LEVEL_COL) return false;
            if (col.headerType !== ExportHeaderType.ColumnHeader) return false;
            // For pivot grids, exclude row dimension fields from regular columns
            if (isPivotGrid && rowDimensionFields.includes(col.field)) return false;
            return true;
        });

        // Check if we have multi-level headers
        const maxLevel = defaultOwner?.maxLevel || 0;
        const maxRowLevel = defaultOwner?.maxRowLevel || 0;
        const hasMultiColumnHeaders = maxLevel > 0 && allColumns.some(col => col.headerType === ExportHeaderType.MultiColumnHeader);
        const hasMultiRowHeaders = maxRowLevel > 0 && rowDimensionFields.length > 0;

        if (leafColumns.length === 0 && data.length > 0 && firstDataElement) {
            // If no columns are defined, use the keys from the first data record
            const keys = Object.keys(firstDataElement.data);

            keys.forEach((key) => {
                leafColumns.push({
                    header: key,
                    field: key,
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    columnSpan: 1,
                    startIndex: 0
                });
            });
        }

        // Create PDF document
        const pdf = new jsPDF({
            orientation: options.pageOrientation,
            unit: 'pt',
            format: options.pageSize
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 40;
        const usableWidth = pageWidth - (2 * margin);

        // Calculate column widths
        // For pivot grids with row dimensions, we need space for both row dimension columns and data columns
        const rowDimensionColumnCount = isPivotGrid && hasMultiRowHeaders ? rowDimensionHeaders.length : 0;
        const totalColumns = rowDimensionColumnCount + leafColumns.length;
        const columnWidth = usableWidth / (totalColumns > 0 ? totalColumns : 1);
        const rowHeight = 20;
        const headerHeight = 25;
        const indentSize = 15; // Indentation per level for hierarchical data (visual indent in first column)
        const childTableIndent = 30; // Indent for child tables

        let yPosition = margin;

        // Set font
        pdf.setFontSize(options.fontSize);

        // Draw multi-level headers if present
        if (hasMultiColumnHeaders || hasMultiRowHeaders) {
            yPosition = this.drawMultiLevelHeaders(
                pdf,
                allColumns,
                rowDimensionHeaders,
                maxLevel,
                maxRowLevel,
                margin,
                yPosition,
                columnWidth,
                headerHeight,
                usableWidth,
                options
            );
        } else {
            // Draw simple single-level headers
            this.drawTableHeaders(pdf, leafColumns, rowDimensionHeaders, margin, yPosition, columnWidth, headerHeight, usableWidth, options);
            yPosition += headerHeight;
        }

        // Draw data rows
        pdf.setFont('helvetica', 'normal');

        let i = 0;
        while (i < data.length) {
            const record = data[i];

            // Skip hidden records (collapsed hierarchy)
            if (record.hidden) {
                i++;
                continue;
            }

            // Check if we need a new page
            if (yPosition + rowHeight > pageHeight - margin) {
                pdf.addPage();
                yPosition = margin;

                // Redraw headers on new page
                if (hasMultiColumnHeaders || hasMultiRowHeaders) {
                    yPosition = this.drawMultiLevelHeaders(
                        pdf,
                        allColumns,
                        rowDimensionHeaders,
                        maxLevel,
                        maxRowLevel,
                        margin,
                        yPosition,
                        columnWidth,
                        headerHeight,
                        usableWidth,
                        options
                    );
                } else {
                    this.drawTableHeaders(pdf, leafColumns, rowDimensionHeaders, margin, yPosition, columnWidth, headerHeight, usableWidth, options);
                    yPosition += headerHeight;
                }
            }

            // Calculate indentation for hierarchical records
            // TreeGrid supports both hierarchical data and flat self-referencing data (with foreignKey)
            // In both cases, the base exporter sets the level property on TreeGridRecord
            const isTreeGrid = record.type === 'TreeGridRecord';
            const recordIsHierarchicalGrid = record.type === 'HierarchicalGridRecord';

            // For tree grids, indentation is visual (in the first column text)
            // For hierarchical grids, we don't use indentation (level determines column offset instead)
            const indentLevel = isTreeGrid ? (record.level || 0) : 0;
            const indent = indentLevel * indentSize;

            // Draw parent row
            this.drawDataRow(pdf, record, leafColumns, rowDimensionFields, margin, yPosition, columnWidth, rowHeight, indent, options);
            yPosition += rowHeight;

            // For hierarchical grids, check if this record has child records
            if (recordIsHierarchicalGrid) {
                const allDescendants = [];

                // Collect all descendant records (children, grandchildren, etc.) that belong to this parent
                // Child records have a different owner (island object) than the parent
                let j = i + 1;
                while (j < data.length && data[j].level > record.level) {
                    // Include all descendants (any level deeper)
                    if (!data[j].hidden) {
                        allDescendants.push(data[j]);
                    }
                    j++;
                }

                // If there are descendant records, draw child table(s)
                if (allDescendants.length > 0) {
                    // Group descendants by owner to separate different child grids
                    // Owner is the actual island object, not a string
                    // Only collect DIRECT children (one level deeper) for initial grouping
                    const directDescendantsByOwner = new Map<any, IExportRecord[]>();

                    for (const desc of allDescendants) {
                        // Only include records that are exactly one level deeper (direct children)
                        if (desc.level === record.level + 1) {
                            const owner = desc.owner;
                            if (!directDescendantsByOwner.has(owner)) {
                                directDescendantsByOwner.set(owner, []);
                            }
                            directDescendantsByOwner.get(owner)!.push(desc);
                        }
                    }

                    // Draw each child grid separately with its direct children only
                    for (const [owner, directChildren] of directDescendantsByOwner) {
                        yPosition = this.drawHierarchicalChildren(
                            pdf,
                            data,
                            allDescendants, // Pass all descendants so grandchildren can be found
                            directChildren,
                            owner,
                            yPosition,
                            margin,
                            childTableIndent,
                            usableWidth,
                            pageHeight,
                            headerHeight,
                            rowHeight,
                            options
                        );
                    }

                    // Skip the descendant records we just processed
                    i = j - 1;
                }
            }

            i++;
        }

        // Save the PDF
        this.saveFile(pdf, options.fileName);
        this.exportEnded.emit({ pdf });
        done();
    }

    private drawMultiLevelHeaders(
        pdf: jsPDF,
        columns: any[],
        rowDimensionHeaders: string[],
        maxLevel: number,
        maxRowLevel: number,
        xStart: number,
        yStart: number,
        baseColumnWidth: number,
        headerHeight: number,
        tableWidth: number,
        options: IgxPdfExporterOptions
    ): number {
        let yPosition = yStart;
        pdf.setFont('helvetica', 'bold');

        // First, draw row dimension header labels (for pivot grids) if present
        if (maxRowLevel > 0 && rowDimensionHeaders.length > 0) {
            // Draw background
            pdf.setFillColor(240, 240, 240);

            rowDimensionHeaders.forEach((headerText, index) => {
                const width = baseColumnWidth;
                const height = headerHeight;
                const xPosition = xStart + (index * baseColumnWidth);

                if (options.showTableBorders) {
                    pdf.rect(xPosition, yPosition, width, height, 'F');
                    pdf.rect(xPosition, yPosition, width, height);
                }

                // Center text in cell
                let displayText = headerText || '';
                const maxTextWidth = width - 10;

                if (pdf.getTextWidth(displayText) > maxTextWidth) {
                    while (pdf.getTextWidth(displayText + '...') > maxTextWidth && displayText.length > 0) {
                        displayText = displayText.substring(0, displayText.length - 1);
                    }
                    displayText += '...';
                }

                const textWidth = pdf.getTextWidth(displayText);
                const textX = xPosition + (width - textWidth) / 2;
                const textY = yPosition + height / 2 + options.fontSize / 3;

                pdf.text(displayText, textX, textY);
            });
        }

        // Filter out row header types and GRID_LEVEL_COL from column rendering
        const columnHeaders = columns.filter(col =>
            col.headerType !== ExportHeaderType.PivotRowHeader &&
            col.headerType !== ExportHeaderType.RowHeader &&
            col.headerType !== ExportHeaderType.MultiRowHeader &&
            col.headerType !== ExportHeaderType.PivotMergedHeader &&
            col.field !== GRID_LEVEL_COL
        );

        const rowDimensionOffset = rowDimensionHeaders.length * baseColumnWidth;

        const totalHeaderLevels = maxLevel + 1;

        // Map layout positions based on actual leaf order so headers align with child data columns
        const headerLayoutMap = new Map<any, number>();
        const leafHeaders = columnHeaders
            .filter(col => col.headerType === ExportHeaderType.ColumnHeader && col.columnSpan > 0)
            .sort((a, b) => (a.startIndex ?? 0) - (b.startIndex ?? 0));

        leafHeaders.forEach((col, idx) => headerLayoutMap.set(col, idx));

        const resolveLayoutStartIndex = (col: any): number => {
            if (headerLayoutMap.has(col)) {
                return headerLayoutMap.get(col)!;
            }

            if (col.headerType === ExportHeaderType.MultiColumnHeader) {
                const childColumns = columnHeaders.filter(child =>
                    child.columnGroupParent === col.columnGroup && child.columnSpan > 0);
                const childIndices = childColumns.map(child => resolveLayoutStartIndex(child));

                if (childIndices.length > 0) {
                    const minIndex = Math.min(...childIndices);
                    headerLayoutMap.set(col, minIndex);
                    return minIndex;
                }
            }

            headerLayoutMap.set(col, 0);
            return 0;
        };

        // Draw column headers level by level (from top/parent to bottom/children)
        for (let level = 0; level <= maxLevel; level++) {
            // Get headers for this level
            const headersForLevel = columnHeaders
                .filter(col =>
                    col.level === level &&
                    (col.headerType === ExportHeaderType.MultiColumnHeader || col.headerType === ExportHeaderType.ColumnHeader)
                )
                .filter(col => col.columnSpan > 0);

            if (headersForLevel.length === 0) {
                yPosition += headerHeight;
                continue;
            }

            // Sort by startIndex to maintain order
            headersForLevel.sort((a, b) => a.startIndex - b.startIndex);

            // Draw each header in this level
            headersForLevel.forEach((col, idx) => {
                const colSpan = col.columnSpan || 1;
                const width = baseColumnWidth * colSpan;
                const normalizedStartIndex = resolveLayoutStartIndex(col);
                const xPosition = xStart + rowDimensionOffset + (normalizedStartIndex * baseColumnWidth);
                const rowSpan = col.headerType === ExportHeaderType.ColumnHeader ?
                    Math.max(1, (totalHeaderLevels - (col.level ?? 0))) :
                    1;
                const height = headerHeight * rowSpan;

                if (options.showTableBorders) {
                    pdf.setFillColor(240, 240, 240);
                    pdf.rect(xPosition, yPosition, width, height, 'F');
                    pdf.rect(xPosition, yPosition, width, height);
                }

                // Center text in cell with truncation if needed
                let headerText = col.header || col.field || '';
                const maxTextWidth = width - 10; // Leave 5px padding on each side

                // Truncate text if it's too long
                if (pdf.getTextWidth(headerText) > maxTextWidth) {
                    while (pdf.getTextWidth(headerText + '...') > maxTextWidth && headerText.length > 0) {
                        headerText = headerText.substring(0, headerText.length - 1);
                    }
                    headerText += '...';
                }

                const textWidth = pdf.getTextWidth(headerText);
                const textX = xPosition + (width - textWidth) / 2;
                const textY = yPosition + (height / 2) + options.fontSize / 3;

                pdf.text(headerText, textX, textY);
            });

            yPosition += headerHeight;
        }

        pdf.setFont('helvetica', 'normal');
        return yPosition;
    }

    private drawHierarchicalChildren(
        pdf: jsPDF,
        allData: IExportRecord[],
        allDescendants: IExportRecord[], // All descendants to search for grandchildren
        childRecords: IExportRecord[], // Direct children to render at this level
        childOwner: any, // Owner is the island object, not a string
        yPosition: number,
        margin: number,
        indentPerLevel: number,
        usableWidth: number,
        pageHeight: number,
        headerHeight: number,
        rowHeight: number,
        options: IgxPdfExporterOptions
    ): number {
        // Get columns for this child owner (owner is the island object)
        // Exclude GRID_LEVEL_COL from child columns
        const childColumns = this._ownersMap.get(childOwner)?.columns.filter(
            col => col.field && col.field !== GRID_LEVEL_COL && !col.skip && col.headerType === ExportHeaderType.ColumnHeader
        ) || [];

        if (childColumns.length === 0) {
            return yPosition;
        }

        // Filter out header records - they should not be rendered as data rows
        const dataRecords = childRecords.filter(r => r.type !== 'HeaderRecord');

        if (dataRecords.length === 0) {
            return yPosition;
        }

        // Add some spacing before child table
        yPosition += 5;

        // Draw child table with indentation
        const childTableWidth = usableWidth - indentPerLevel;
        const childColumnWidth = childTableWidth / childColumns.length;
        const childTableX = margin + indentPerLevel;

        // Check if we need a new page for headers
        if (yPosition + headerHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
        }

        // Draw child table headers
        const childOwnerObj = this._ownersMap.get(childOwner);
        const hasMultiColumnHeaders = childOwnerObj?.maxLevel > 0 && childOwnerObj.columns.some(col => col.headerType === ExportHeaderType.MultiColumnHeader);

        if (hasMultiColumnHeaders) {
            yPosition = this.drawMultiLevelHeaders(
                pdf,
                childOwnerObj.columns,
                [], // rowDimensionHeaders, if any
                childOwnerObj.maxLevel,
                0, // maxRowLevel
                childTableX,
                yPosition,
                childColumnWidth,
                headerHeight,
                childTableWidth,
                options
            );
        } else {
            this.drawTableHeaders(pdf, childColumns, [], childTableX, yPosition, childColumnWidth, headerHeight, childTableWidth, options);
            yPosition += headerHeight;
        }

        // Find the minimum level in these records (direct children of parent)
        const minLevel = Math.min(...dataRecords.map(r => r.level));

        // Process each record at the minimum level (direct children)
        const directChildren = dataRecords.filter(r => r.level === minLevel);

        for (const childRecord of directChildren) {
            // Check if we need a new page
            if (yPosition + rowHeight > pageHeight - margin) {
                pdf.addPage();
                yPosition = margin;
                // Redraw headers on new page
                this.drawTableHeaders(pdf, childColumns, [], childTableX, yPosition, childColumnWidth, headerHeight, childTableWidth, options);
                yPosition += headerHeight;
            }

            // Draw the child record
            this.drawDataRow(pdf, childRecord, childColumns, [], childTableX, yPosition, childColumnWidth, rowHeight, 0, options);
            yPosition += rowHeight;

            // Check if this child has grandchildren (deeper levels in different child grids)
            // Look for grandchildren in allDescendants that are direct descendants of this childRecord
            const grandchildrenForThisRecord = allDescendants.filter(r =>
                r.level === childRecord.level + 1 && r.type !== 'HeaderRecord'
            );

            if (grandchildrenForThisRecord.length > 0) {
                // Group grandchildren by their owner (different child islands under this record)
                const grandchildrenByOwner = new Map<any, IExportRecord[]>();

                for (const gc of grandchildrenForThisRecord) {
                    // Use the actual owner object
                    const gcOwner = gc.owner;
                    // Only include grandchildren that have a different owner (separate child grid)
                    if (gcOwner !== childOwner) {
                        if (!grandchildrenByOwner.has(gcOwner)) {
                            grandchildrenByOwner.set(gcOwner, []);
                        }
                        grandchildrenByOwner.get(gcOwner)!.push(gc);
                    }
                }

                // Recursively draw each grandchild owner's records with increased indentation
                for (const [gcOwner, directGrandchildren] of grandchildrenByOwner) {
                    yPosition = this.drawHierarchicalChildren(
                        pdf,
                        allData,
                        allDescendants, // Pass all descendants so great-grandchildren can be found
                        directGrandchildren, // Direct grandchildren to render
                        gcOwner,
                        yPosition,
                        margin,
                        indentPerLevel + 30, // Increase indentation for next level
                        usableWidth,
                        pageHeight,
                        headerHeight,
                        rowHeight,
                        options
                    );
                }
            }
        }

        // Add spacing after child table
        yPosition += 5;

        return yPosition;
    }

    private drawTableHeaders(
        pdf: jsPDF,
        columns: any[],
        rowDimensionHeaders: string[],
        xStart: number,
        yPosition: number,
        columnWidth: number,
        headerHeight: number,
        tableWidth: number,
        options: IgxPdfExporterOptions
    ): void {
        pdf.setFont('helvetica', 'bold');
        pdf.setFillColor(240, 240, 240);

        if (options.showTableBorders) {
            pdf.rect(xStart, yPosition, tableWidth, headerHeight, 'F');
        }

        // Draw row dimension headers first (for pivot grids)
        rowDimensionHeaders.forEach((headerText, index) => {
            const xPosition = xStart + (index * columnWidth);
            let displayText = headerText;

            if (options.showTableBorders) {
                pdf.rect(xPosition, yPosition, columnWidth, headerHeight);
            }

            // Truncate text if it's too long
            const maxTextWidth = columnWidth - 10;
            if (pdf.getTextWidth(displayText) > maxTextWidth) {
                while (pdf.getTextWidth(displayText + '...') > maxTextWidth && displayText.length > 0) {
                    displayText = displayText.substring(0, displayText.length - 1);
                }
                displayText += '...';
            }

            // Center text in cell
            const textWidth = pdf.getTextWidth(displayText);
            const textX = xPosition + (columnWidth - textWidth) / 2;
            const textY = yPosition + headerHeight / 2 + options.fontSize / 3;

            pdf.text(displayText, textX, textY);
        });

        const rowDimensionOffset = rowDimensionHeaders.length * columnWidth;

        // Draw data column headers
        columns.forEach((col, index) => {
            // Skip GRID_LEVEL_COL - it shouldn't be rendered
            if (col.field === GRID_LEVEL_COL) {
                return;
            }

            const xPosition = xStart + rowDimensionOffset + (index * columnWidth);
            let headerText = col.header || col.field;

            if (options.showTableBorders) {
                pdf.rect(xPosition, yPosition, columnWidth, headerHeight);
            }

            // Truncate text if it's too long
            const maxTextWidth = columnWidth - 10; // Leave 5px padding on each side
            if (pdf.getTextWidth(headerText) > maxTextWidth) {
                while (pdf.getTextWidth(headerText + '...') > maxTextWidth && headerText.length > 0) {
                    headerText = headerText.substring(0, headerText.length - 1);
                }
                headerText += '...';
            }

            // Center text in cell
            const textWidth = pdf.getTextWidth(headerText);
            const textX = xPosition + (columnWidth - textWidth) / 2;
            const textY = yPosition + headerHeight / 2 + options.fontSize / 3;

            pdf.text(headerText, textX, textY);
        });

        pdf.setFont('helvetica', 'normal');
    }

    private drawDataRow(
        pdf: jsPDF,
        record: IExportRecord,
        columns: any[],
        rowDimensionFields: string[],
        xStart: number,
        yPosition: number,
        columnWidth: number,
        rowHeight: number,
        indent: number,
        options: IgxPdfExporterOptions
    ): void {
        const isSummaryRecord = record.type === 'SummaryRecord';

        // Draw row dimension cells first (for pivot grids)
        // These are actual data values from the record, not column headers
        rowDimensionFields.forEach((fieldName, index) => {
            const xPosition = xStart + (index * columnWidth);
            let cellValue = record.data[fieldName];

            // Convert value to string
            if (cellValue === null || cellValue === undefined) {
                cellValue = '';
            } else if (cellValue instanceof Date) {
                cellValue = cellValue.toLocaleDateString();
            } else {
                cellValue = String(cellValue);
            }

            if (options.showTableBorders) {
                pdf.rect(xPosition, yPosition, columnWidth, rowHeight);
            }

            // Truncate text if it's too long
            const maxTextWidth = columnWidth - 10;
            let displayText = cellValue;

            if (pdf.getTextWidth(displayText) > maxTextWidth) {
                while (pdf.getTextWidth(displayText + '...') > maxTextWidth && displayText.length > 0) {
                    displayText = displayText.substring(0, displayText.length - 1);
                }
                displayText += '...';
            }

            const textY = yPosition + rowHeight / 2 + options.fontSize / 3;
            pdf.text(displayText, xPosition + 5, textY);
        });

        const rowDimensionOffset = rowDimensionFields.length * columnWidth;

        // Draw data columns
        columns.forEach((col, index) => {
            // Skip GRID_LEVEL_COL - it's an internal column
            if (col.field === GRID_LEVEL_COL) {
                return;
            }

            const xPosition = xStart + rowDimensionOffset + (index * columnWidth);
            let cellValue = record.data[col.field];

            // Handle summary records - cellValue is an IgxSummaryResult object
            if (isSummaryRecord && cellValue) {
                // For summary records, the cellValue has label and value properties
                // or it might be summaryResult property
                if (cellValue.label !== undefined || cellValue.value !== undefined) {
                    const label = cellValue.label?.toString() || '';
                    const value = cellValue.value?.toString() || cellValue.summaryResult?.toString() || '';
                    if (label && value) {
                        cellValue = `${label}: ${value}`;
                    } else if (label) {
                        cellValue = label;
                    } else if (value) {
                        cellValue = value;
                    } else {
                        cellValue = '';
                    }
                } else if (cellValue.summaryResult !== undefined) {
                    cellValue = cellValue.summaryResult;
                }
            }

            // Convert value to string
            if (cellValue === null || cellValue === undefined) {
                cellValue = '';
            } else if (cellValue instanceof Date) {
                cellValue = cellValue.toLocaleDateString();
            } else {
                cellValue = String(cellValue);
            }

            if (options.showTableBorders) {
                pdf.rect(xPosition, yPosition, columnWidth, rowHeight);
            }

            // Apply indentation to the first column for hierarchical data
            const textIndent = (index === 0) ? indent : 0;

            // Truncate text if it's too long, accounting for indentation
            const maxTextWidth = columnWidth - 10 - textIndent;
            let displayText = cellValue;

            if (pdf.getTextWidth(displayText) > maxTextWidth) {
                while (pdf.getTextWidth(displayText + '...') > maxTextWidth && displayText.length > 0) {
                    displayText = displayText.substring(0, displayText.length - 1);
                }
                displayText += '...';
            }

            const textY = yPosition + rowHeight / 2 + options.fontSize / 3;
            pdf.text(displayText, xPosition + 5 + textIndent, textY);
        });
    }

    private saveFile(pdf: jsPDF, fileName: string): void {
        const blob = pdf.output('blob');
        ExportUtilities.saveBlobToFile(blob, fileName);
    }
}
