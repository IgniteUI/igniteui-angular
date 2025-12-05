import { EventEmitter, Injectable } from '@angular/core';
import { DEFAULT_OWNER, ExportHeaderType, ExportRecordType, GRID_LEVEL_COL, IExportRecord, IgxBaseExporter } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxPdfExporterOptions } from './pdf-exporter-options';
import { IBaseEventArgs } from 'igniteui-angular/core';
import type { jsPDF } from 'jspdf';

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
            const uniqueFields = new Set<string>();

            // Primary source: use dimensionKeys from the first record (set by base exporter)
            // This is the authoritative source for dimension field names
            if (firstDataElement?.dimensionKeys && Array.isArray(firstDataElement.dimensionKeys) && firstDataElement.dimensionKeys.length > 0) {
                firstDataElement.dimensionKeys.forEach(key => {
                    if (!uniqueFields.has(key)) {
                        uniqueFields.add(key);
                        rowDimensionFields.push(key);
                    }
                });
            }

            // If we still don't have fields, try to get them from the record data
            if (rowDimensionFields.length === 0 && firstDataElement && firstDataElement.data) {
                // Fallback: Try to infer dimension keys from the record data structure
                // Get row dimension columns to understand the structure
                const rowHeaderCols = allColumns.filter(col =>
                    (col.headerType === ExportHeaderType.RowHeader ||
                    col.headerType === ExportHeaderType.MultiRowHeader ||
                    col.headerType === ExportHeaderType.PivotMergedHeader) &&
                    !col.skip
                );

                const recordKeys = Object.keys(firstDataElement.data);
                // Try to match row dimension columns to record keys
                rowHeaderCols.forEach(col => {
                    const fieldName = typeof col.field === 'string' ? col.field : null;
                    const columnGroup = typeof col.columnGroup === 'string' ? col.columnGroup :
                                       (typeof col.columnGroupParent === 'string' ? col.columnGroupParent : null);
                    // Check if the field or column group exists in record data
                    if (fieldName && recordKeys.includes(fieldName) && !uniqueFields.has(fieldName)) {
                        uniqueFields.add(fieldName);
                        rowDimensionFields.push(fieldName);
                    } else if (columnGroup && recordKeys.includes(columnGroup) && !uniqueFields.has(columnGroup)) {
                        uniqueFields.add(columnGroup);
                        rowDimensionFields.push(columnGroup);
                    }
                });

                // If still no fields found, use the first few simple keys from record data
                // (dimension keys are usually simple, aggregation keys are often complex)
                if (rowDimensionFields.length === 0) {
                    const simpleKeys = recordKeys.filter(key => {
                        // Dimension keys are typically simple (no separators, reasonable length)
                        return !key.includes('-') && !key.includes('_') &&
                               key.length < 50 &&
                               key === key.trim();
                    });
                    // Take up to the number of row dimensions (usually 1-3)
                    simpleKeys.slice(0, Math.min(3, simpleKeys.length)).forEach(key => {
                        if (!uniqueFields.has(key)) {
                            uniqueFields.add(key);
                            rowDimensionFields.push(key);
                        }
                    });
                }
            }

            // Ensure we have at least some fields - if not, we can't display dimension values
            // In this case, we'll still draw the columns but they'll be empty

            // Get PivotRowHeader columns - these are the dimension names (like "All My Products", "Product", "City")
            // These should match the enabled row dimensions in order
            const pivotRowHeaders = allColumns
                .filter(col => col.headerType === ExportHeaderType.PivotRowHeader)
                .sort((a, b) => (a.startIndex ?? 0) - (b.startIndex ?? 0));

            // Use PivotRowHeader names as column headers
            const sortedPivotRowHeaders = pivotRowHeaders.map(col => col.header || col.field).filter(h => h);
            rowDimensionHeaders.push(...sortedPivotRowHeaders);

            // For hierarchical dimensions, we might need to add child level headers
            // Check if we have row dimension columns at different levels that aren't covered by PivotRowHeaders
            if (rowDimensionHeaders.length < rowDimensionFields.length) {
                // Get row dimension columns to find missing headers
                const rowHeaderCols = allColumns
                    .filter(col =>
                        (col.headerType === ExportHeaderType.RowHeader ||
                         col.headerType === ExportHeaderType.MultiRowHeader ||
                         col.headerType === ExportHeaderType.PivotMergedHeader) &&
                        col.field &&
                        !col.skip
                    )
                    .sort((a, b) => {
                        const levelDiff = (a.level ?? 0) - (b.level ?? 0);
                        if (levelDiff !== 0) return levelDiff;
                        return (a.startIndex ?? 0) - (b.startIndex ?? 0);
                    });

                // Add missing headers using the header property from row dimension columns
                const existingHeaders = new Set(rowDimensionHeaders);
                rowHeaderCols.forEach(col => {
                    const fieldName = typeof col.field === 'string' ? col.field : null;
                    const headerName = (typeof col.header === 'string' ? col.header : fieldName) || '';
                    // If this field is in rowDimensionFields but header is missing, add it
                    if (fieldName && rowDimensionFields.includes(fieldName) && !existingHeaders.has(headerName)) {
                        // Only add if we haven't reached the target count
                        if (rowDimensionHeaders.length < rowDimensionFields.length) {
                            rowDimensionHeaders.push(headerName);
                            existingHeaders.add(headerName);
                        }
                    }
                });

                // If still missing, use field names
                for (let i = rowDimensionHeaders.length; i < rowDimensionFields.length; i++) {
                    rowDimensionHeaders.push(rowDimensionFields[i]);
                }
            } else if (rowDimensionHeaders.length > rowDimensionFields.length) {
                // Trim excess headers to match fields count
                rowDimensionHeaders.splice(rowDimensionFields.length);
            }
        }

        // Get leaf columns (actual data columns), excluding GRID_LEVEL_COL and row dimension fields
        // For pivot grids, we need to exclude row dimension fields since they're rendered separately
        let leafColumns = allColumns.filter(col => {
            if (col.field === GRID_LEVEL_COL) return false;
            if (col.headerType !== ExportHeaderType.ColumnHeader) return false;
            // For pivot grids, exclude row dimension fields from regular columns
            if (isPivotGrid && rowDimensionFields.includes(col.field)) return false;
            return true;
        });

        // Sort leaf columns by startIndex to maintain proper order
        leafColumns = leafColumns.sort((a, b) => (a.startIndex ?? 0) - (b.startIndex ?? 0));

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
        // Dynamically import jsPDF to reduce initial bundle size
        import('jspdf').then(({ jsPDF }) => {
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
            // Use the maximum of headers and fields to ensure we have space for all columns
            // Headers determine how many columns to display, fields determine what data to show
            const rowDimensionColumnCount = isPivotGrid ? Math.max(rowDimensionHeaders.length, rowDimensionFields.length) : 0;
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
            // For pivot grids, always draw row dimension headers if they exist, even if there are no multi-column headers
            if (hasMultiColumnHeaders || (isPivotGrid && rowDimensionHeaders.length > 0)) {
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
                    options,
                    allColumns
                );
            } else {
                // Draw simple single-level headers
                this.drawTableHeaders(pdf, leafColumns, rowDimensionHeaders, margin, yPosition, columnWidth, headerHeight, usableWidth, options);
                yPosition += headerHeight;
            }

            // Draw data rows
            pdf.setFont('helvetica', 'normal');

            // Check if this is a tree grid export (tree grids can have both TreeGridRecord and DataRecord types for nested children)
            const isTreeGridExport = data.some(record => record.type === ExportRecordType.TreeGridRecord);

            // For pivot grids, get row dimension columns to help with value lookup
            const rowDimensionColumnsByLevel: Map<number, any[]> = new Map();
            if (isPivotGrid && defaultOwner) {
                const allRowDimCols = allColumns.filter(col =>
                    (col.headerType === ExportHeaderType.RowHeader ||
                    col.headerType === ExportHeaderType.MultiRowHeader ||
                    col.headerType === ExportHeaderType.PivotMergedHeader) &&
                    !col.skip
                );
                // Group by level
                allRowDimCols.forEach(col => {
                    const level = col.level ?? 0;
                    if (!rowDimensionColumnsByLevel.has(level)) {
                        rowDimensionColumnsByLevel.set(level, []);
                    }
                    rowDimensionColumnsByLevel.get(level)!.push(col);
                });
                // Sort each level by startIndex
                rowDimensionColumnsByLevel.forEach((cols, level) => {
                    cols.sort((a, b) => (a.startIndex ?? 0) - (b.startIndex ?? 0));
                });
            }

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
                            options,
                            allColumns
                        );
                    } else {
                        this.drawTableHeaders(pdf, leafColumns, rowDimensionHeaders, margin, yPosition, columnWidth, headerHeight, usableWidth, options);
                        yPosition += headerHeight;
                    }
                }

                // Calculate indentation for hierarchical records
                // TreeGrid supports both hierarchical data and flat self-referencing data (with foreignKey)
                // In both cases, the base exporter sets the level property on TreeGridRecord
                // Note: Nested child records without children are created as DataRecord type,
                // but they still have a level property and should be treated as tree grid records
                const recordIsHierarchicalGrid = record.type === 'HierarchicalGridRecord';

                // For tree grids, indentation is visual (in the first column text)
                // For hierarchical grids, we don't use indentation (level determines column offset instead)
                // If this is a tree grid export and the record has a level property, use it for indentation
                const indentLevel = (isTreeGridExport && record.level !== undefined) ? (record.level || 0) : 0;
                const indent = indentLevel * indentSize;

                // Draw parent row
                this.drawDataRow(pdf, record, leafColumns, rowDimensionFields, margin, yPosition, columnWidth, rowHeight, indent, options, allColumns, isPivotGrid, rowDimensionColumnsByLevel, i, rowDimensionHeaders);
                yPosition += rowHeight;

                // For hierarchical grids, check if this record has child records
                if (recordIsHierarchicalGrid) {
                    const allDescendants: Array<IExportRecord & { __index: number }> = [];

                    let j = i + 1;
                    while (j < data.length && data[j].level > record.level) {
                        if (!data[j].hidden) {
                            // Attach the original index into data
                            allDescendants.push({ ...(data[j] as any), __index: j });
                        }
                        j++;
                    }

                    if (allDescendants.length > 0) {
                        const directDescendantsByOwner = new Map<any, Array<IExportRecord & { __index: number }>>();

                        for (const desc of allDescendants) {
                            if (desc.level === record.level + 1) {
                                const owner = desc.owner;
                                if (!directDescendantsByOwner.has(owner)) {
                                    directDescendantsByOwner.set(owner, []);
                                }
                                directDescendantsByOwner.get(owner)!.push(desc);
                            }
                        }

                        for (const [owner, directChildren] of directDescendantsByOwner) {
                            yPosition = this.drawHierarchicalChildren(
                                pdf,
                                data,
                                allDescendants,   // descendants WITH __index
                                directChildren,   // direct children WITH __index
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

                        i = j - 1;
                    }
                }

                i++;
            }

            // Save the PDF
            this.saveFile(pdf, options.fileName);
            this.exportEnded.emit({ pdf });
            done();
        });
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
        options: IgxPdfExporterOptions,
        allColumns?: any[]
    ): number {
        let yPosition = yStart;
        pdf.setFont('helvetica', 'bold');

        // First, draw row dimension header labels (for pivot grids) if present
        // Draw headers if we have any row dimension headers, regardless of maxRowLevel
        if (rowDimensionHeaders.length > 0 && allColumns) {
            // Get PivotRowHeader columns - these are the dimension header names
            const pivotRowHeaderCols = allColumns.filter(col =>
                col.headerType === ExportHeaderType.PivotRowHeader &&
                !col.skip
            ).sort((a, b) => (a.startIndex ?? 0) - (b.startIndex ?? 0));

            // Calculate how many header rows the data columns have (cities + number/value = 2 rows)
            // The row dimension headers should span across all data column header rows
            const dataColumnHeaderRows = maxLevel + 1; // maxLevel is 0-based, so +1 gives us the number of rows
            const rowDimensionHeaderRowSpan = Math.max(dataColumnHeaderRows, 1);

            // Draw each PivotRowHeader with rowSpan to span across data column headers
            pivotRowHeaderCols.forEach((pivotCol, index) => {
                const xPosition = xStart + (index * baseColumnWidth);
                const headerText = pivotCol.header || pivotCol.field || rowDimensionHeaders[index] || '';
                const width = baseColumnWidth;
                const height = headerHeight * rowDimensionHeaderRowSpan;

                // Skip if this is a merged/empty header that shouldn't be drawn
                // PivotMergedHeader columns are typically placeholders and shouldn't be drawn separately
                // Also skip if header text is empty and it's not a valid header
                if ((pivotCol.headerType === ExportHeaderType.PivotMergedHeader && !headerText) ||
                    (!headerText && !pivotCol.header && !pivotCol.field)) {
                    return;
                }

                // Set fill color to light gray for header background (explicitly set before each cell)
                pdf.setFillColor(240, 240, 240);
                // Set stroke color to black for borders
                pdf.setDrawColor(0, 0, 0);

                if (options.showTableBorders) {
                    // Draw filled rectangle for background (light gray)
                    pdf.rect(xPosition, yPosition, width, height, 'F');
                    // Draw border (black outline) - this should not fill, just stroke
                    pdf.rect(xPosition, yPosition, width, height);
                } else {
                    // Even without borders, draw background
                    pdf.rect(xPosition, yPosition, width, height, 'F');
                }

                // Only draw text if we have content
                if (headerText) {
                    // Center text in merged cell
                    let displayText = headerText;
                    const maxTextWidth = width - 10;

                    if (pdf.getTextWidth(displayText) > maxTextWidth) {
                        while (pdf.getTextWidth(displayText + '...') > maxTextWidth && displayText.length > 0) {
                            displayText = displayText.substring(0, displayText.length - 1);
                        }
                        displayText += '...';
                    }

                    const textWidth = pdf.getTextWidth(displayText);
                    const textX = xPosition + (width - textWidth) / 2;
                    const textY = yPosition + (height / 2) + options.fontSize / 3;

                    pdf.text(displayText, textX, textY);
                }
            });

            // Don't move yPosition yet - data column headers will be drawn at the same yPosition
            // We'll move yPosition after drawing all header rows
        } else if (rowDimensionHeaders.length > 0) {
            // Fallback: draw simple headers without merging
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
            yPosition += headerHeight;
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
                    pdf.setDrawColor(0, 0, 0);
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

        // After drawing all headers, move yPosition down by the total header height
        // For pivot grids with row dimension headers, this should be the max of row dimension header height and data column header height
        if (rowDimensionHeaders.length > 0 && allColumns) {
            const dataColumnHeaderRows = maxLevel + 1;
            const rowDimensionHeaderRowSpan = Math.max(dataColumnHeaderRows, 1);
            const totalHeaderHeight = headerHeight * rowDimensionHeaderRowSpan;
            yPosition = yStart + totalHeaderHeight;
        }

        pdf.setFont('helvetica', 'normal');
        return yPosition;
    }

    private drawHierarchicalChildren(
        pdf: jsPDF,
        allData: IExportRecord[],
        allDescendants: any[], // All descendants to search for grandchildren
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
        // Get columns for this child owner
        const childOwnerObj = this._ownersMap.get(childOwner);

        const allChildColumns = childOwnerObj?.columns.filter(
            col => col.field !== GRID_LEVEL_COL && !col.skip
        ) || [];

        const childColumns = allChildColumns.filter(
            col => col.headerType === ExportHeaderType.ColumnHeader
        );

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

        // Calculate available width after indentation
        const availableWidth = usableWidth - indentPerLevel;

        // Calculate total column span for proper width distribution
        const maxLevel = childOwnerObj?.maxLevel || 0;

        // Fix startIndex for all child columns
        let currentIndex = 0;
        for (const col of allChildColumns) {
            if (col.level === 0 && (col.headerType === ExportHeaderType.MultiColumnHeader || col.headerType === ExportHeaderType.ColumnHeader)) {
                col.startIndex = currentIndex;
                currentIndex += col.columnSpan || 1;
            }
        }

        let totalColumnSpan = 0;
        if (maxLevel > 0) {
            const baseLevelColumns = allChildColumns.filter(col =>
                col.level === 0 &&
                (col.headerType === ExportHeaderType.MultiColumnHeader || col.headerType === ExportHeaderType.ColumnHeader)
            );
            totalColumnSpan = baseLevelColumns.reduce((sum, col) => sum + (col.columnSpan || 1), 0);
        } else {
            totalColumnSpan = childColumns.length;
        }

        // Recalculate column width based on child's column count and available width
        const childColumnWidth = availableWidth / totalColumnSpan;
        const actualChildTableWidth = childColumnWidth * totalColumnSpan;
        const childTableX = margin + indentPerLevel;

        // Check if we need a new page for headers
        if (yPosition + headerHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
        }

        // Draw child table headers
        const hasMultiColumnHeaders = maxLevel > 0 && childOwnerObj.columns.some(col => col.headerType === ExportHeaderType.MultiColumnHeader);

        if (hasMultiColumnHeaders) {
            yPosition = this.drawMultiLevelHeaders(
                pdf,
                allChildColumns,
                [], // rowDimensionHeaders, if any
                maxLevel,
                0, // maxRowLevel
                childTableX,
                yPosition,
                childColumnWidth,
                headerHeight,
                actualChildTableWidth,
                options
            );
        } else {
            this.drawTableHeaders(pdf, childColumns, [], childTableX, yPosition, childColumnWidth, headerHeight, actualChildTableWidth, options);
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
                if (hasMultiColumnHeaders) {
                    yPosition = this.drawMultiLevelHeaders(
                        pdf, allChildColumns, [], maxLevel, 0,
                        childTableX, yPosition, childColumnWidth, headerHeight,
                        actualChildTableWidth, options
                    );
                } else {
                    this.drawTableHeaders(pdf, childColumns, [], childTableX, yPosition, childColumnWidth, headerHeight, actualChildTableWidth, options);
                    yPosition += headerHeight;
                }
            }

            // Draw the child record
            this.drawDataRow(pdf, childRecord, childColumns, [], childTableX, yPosition, childColumnWidth, rowHeight, 0, options);
            yPosition += rowHeight;

            // allDescendants here is an array of records with an extra __index property
            const childIndex = (childRecord as any).__index as number | undefined;

            if (childIndex !== undefined) {
                // Find this child's position in allDescendants (by original index)
                const childPosInDesc = allDescendants.findIndex(d => d.__index === childIndex);

                if (childPosInDesc !== -1) {
                    const subtree: Array<IExportRecord & { __index: number }> = [];
                    const childLevel = childRecord.level;

                    // Collect all deeper records until we hit same-or-higher level
                    for (let k = childPosInDesc + 1; k < allDescendants.length; k++) {
                        const rec = allDescendants[k];
                        if (rec.level <= childLevel) {
                            break;
                        }
                        if (rec.type !== 'HeaderRecord') {
                            subtree.push(rec);
                        }
                    }

                    if (subtree.length > 0) {
                        // Direct grandchildren for this child: exactly one level deeper
                        const grandchildrenForThisRecord = subtree.filter(r =>
                            r.level === childRecord.level + 1 && r.owner !== childOwner
                        );

                        if (grandchildrenForThisRecord.length > 0) {
                            const grandchildrenByOwner = new Map<any, Array<IExportRecord & { __index: number }>>();

                            for (const gc of grandchildrenForThisRecord) {
                                const gcOwner = gc.owner;
                                if (!grandchildrenByOwner.has(gcOwner)) {
                                    grandchildrenByOwner.set(gcOwner, []);
                                }
                                grandchildrenByOwner.get(gcOwner)!.push(gc);
                            }

                            for (const [gcOwner, directGrandchildren] of grandchildrenByOwner) {
                                yPosition = this.drawHierarchicalChildren(
                                    pdf,
                                    allData,
                                    subtree,            // only this child's subtree for deeper levels
                                    directGrandchildren,
                                    gcOwner,
                                    yPosition,
                                    margin,
                                    indentPerLevel + 20,
                                    usableWidth,
                                    pageHeight,
                                    headerHeight,
                                    rowHeight,
                                    options
                                );
                            }
                        }
                    }
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
        options: IgxPdfExporterOptions,
        allColumns?: any[],
        isPivotGrid?: boolean,
        rowDimensionColumnsByLevel?: Map<number, any[]>,
        recordIndex?: number,
        rowDimensionHeaders?: string[]
    ): void {
        const isSummaryRecord = record.type === 'SummaryRecord';

        // Draw row dimension cells first (for pivot grids)
        // For pivot grids, the row dimension columns have 'header' property that contains the actual dimension values
        // Use the maximum of fields and headers to ensure we draw all columns
        const maxRowDimCols = Math.max(rowDimensionFields.length, rowDimensionHeaders?.length || 0);
        for (let index = 0; index < maxRowDimCols; index++) {
            const xPosition = xStart + (index * columnWidth);
            let cellValue: any = null;

            // Primary approach: Get the value from row dimension columns' header property
            // The row dimension columns are created with header = actual dimension value to display
            if (isPivotGrid && allColumns) {
                // Get all row dimension columns sorted by level and startIndex
                const allRowDimCols = allColumns.filter(col =>
                    (col.headerType === ExportHeaderType.RowHeader ||
                     col.headerType === ExportHeaderType.MultiRowHeader ||
                     col.headerType === ExportHeaderType.PivotMergedHeader) &&
                    !col.skip
                ).sort((a, b) => {
                    const levelDiff = (a.level ?? 0) - (b.level ?? 0);
                    if (levelDiff !== 0) return levelDiff;
                    return (a.startIndex ?? 0) - (b.startIndex ?? 0);
                });

                // For hierarchical dimensions, match columns by level
                // The index corresponds to the dimension level (0 = first dimension, 1 = second, etc.)
                const colsForLevel = allRowDimCols.filter(col => (col.level ?? 0) === index);

                // The row dimension columns are created in the same order as records appear
                // We can use the record index to find the corresponding column
                // However, for hierarchical dimensions, we need to account for row spans
                if (colsForLevel.length > 0) {
                    // Try to find the column that matches this record
                    // First, try matching by checking if column field/header matches record data
                    let matchedCol = null;
                    if (record.data) {
                        for (const col of colsForLevel) {
                            const colField = typeof col.field === 'string' ? col.field : null;
                            const colHeader = typeof col.header === 'string' ? col.header : null;

                            // Check if column field exists as a key in record data
                            if (colField && record.data[colField] !== undefined) {
                                matchedCol = col;
                                break;
                            }
                            // Check if column header matches a value in record data
                            if (colHeader) {
                                const recordValues = Object.values(record.data).map(v => String(v));
                                if (recordValues.includes(colHeader)) {
                                    matchedCol = col;
                                    break;
                                }
                            }
                        }
                    }

                    // If no match found, try to use record index to select column
                    // This works because columns are created in the same order as records
                    if (!matchedCol && recordIndex !== undefined) {
                        // For hierarchical dimensions with row spans, we need to account for that
                        // For now, use a simple index-based approach
                        const colIndex = Math.min(recordIndex, colsForLevel.length - 1);
                        matchedCol = colsForLevel[colIndex];
                    }

                    // If still no match, use the first column at this level
                    if (!matchedCol && colsForLevel.length > 0) {
                        matchedCol = colsForLevel[0];
                    }

                    // Use the header property - it contains the actual dimension value to display
                    if (matchedCol) {
                        if (matchedCol.header && typeof matchedCol.header === 'string') {
                            cellValue = matchedCol.header;
                        } else if (matchedCol.field && typeof matchedCol.field === 'string') {
                            cellValue = matchedCol.field;
                        }
                    }
                }
            }

            // Fallback: Try to get value using dimensionKeys (member names as keys in record.data)
            if ((cellValue === null || cellValue === undefined) && record.data) {
                const fieldName = rowDimensionFields[index];
                if (fieldName) {
                    cellValue = record.data[fieldName];
                }
            }

            // Last resort: Try to find it by checking all keys in record data
            if ((cellValue === null || cellValue === undefined) && record.data) {
                const recordKeys = Object.keys(record.data);
                const fieldName = rowDimensionFields[index];

                // If we have a fieldName, try exact and fuzzy matching
                if (fieldName) {
                    const matchingKey = recordKeys.find(key =>
                        key.toLowerCase() === fieldName.toLowerCase() ||
                        key === fieldName ||
                        fieldName.toLowerCase().includes(key.toLowerCase()) ||
                        key.toLowerCase().includes(fieldName.toLowerCase())
                    );
                    if (matchingKey) {
                        cellValue = record.data[matchingKey];
                    }
                }

                // For hierarchical dimensions, try using dimension keys by index
                if ((cellValue === null || cellValue === undefined) && isPivotGrid && recordKeys.length > 0) {
                    const possibleDimKeys = recordKeys.filter(key => {
                        return !key.includes('-') && !key.includes('_') &&
                               key === key.trim() &&
                               key.length < 50;
                    });

                    if (possibleDimKeys.length > index) {
                        cellValue = record.data[possibleDimKeys[index]];
                    } else if (possibleDimKeys.length > 0) {
                        cellValue = record.data[possibleDimKeys[0]];
                    }
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
                pdf.setFillColor(255, 255, 255);
                pdf.setDrawColor(0, 0, 0);
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
        }

        const rowDimensionOffset = maxRowDimCols * columnWidth;

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
                pdf.setFillColor(255, 255, 255);
                pdf.setDrawColor(0, 0, 0);
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
