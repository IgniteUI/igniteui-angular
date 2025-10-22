import { EventEmitter, Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { DEFAULT_OWNER, ExportHeaderType, IExportRecord, IgxBaseExporter } from '../exporter-common/base-export-service';
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
        const defaultOwner = this._ownersMap.get(DEFAULT_OWNER);

        // Get all columns (including multi-column headers)
        const allColumns = defaultOwner?.columns.filter(col => !col.skip) || [];

        // Get leaf columns (actual data columns)
        const leafColumns = allColumns.filter(col => col.field && col.headerType === ExportHeaderType.ColumnHeader);

        // Check if we have multi-level headers
        const maxLevel = defaultOwner?.maxLevel || 0;
        const hasMultiColumnHeaders = maxLevel > 0 && allColumns.some(col => col.headerType === ExportHeaderType.MultiColumnHeader);

        if (leafColumns.length === 0 && data.length > 0) {
            // If no columns are defined, use the keys from the first data record
            const firstDataElement = data[0];
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

        // Calculate column widths based on leaf columns
        const columnWidth = usableWidth / leafColumns.length;
        const rowHeight = 20;
        const headerHeight = 25;
        const indentSize = 15; // Indentation per level for hierarchical data
        const childTableIndent = 30; // Indent for child tables

        let yPosition = margin;

        // Set font
        pdf.setFontSize(options.fontSize);

        // Draw multi-level headers if present
        if (hasMultiColumnHeaders) {
            yPosition = this.drawMultiLevelHeaders(pdf, allColumns, maxLevel, margin, yPosition, columnWidth, headerHeight, usableWidth, options);
        } else {
            // Draw simple single-level headers
            this.drawTableHeaders(pdf, leafColumns, margin, yPosition, columnWidth, headerHeight, usableWidth, options);
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
                if (hasMultiColumnHeaders) {
                    yPosition = this.drawMultiLevelHeaders(pdf, allColumns, maxLevel, margin, yPosition, columnWidth, headerHeight, usableWidth, options);
                } else {
                    this.drawTableHeaders(pdf, leafColumns, margin, yPosition, columnWidth, headerHeight, usableWidth, options);
                    yPosition += headerHeight;
                }
            }

            // Calculate indentation for hierarchical records
            // TreeGrid supports both hierarchical data and flat self-referencing data (with foreignKey)
            // In both cases, the base exporter sets the level property on TreeGridRecord
            const isTreeGrid = record.type === 'TreeGridRecord';
            const isHierarchicalGrid = record.type === 'HierarchicalGridRecord';
            const indentLevel = (isTreeGrid || isHierarchicalGrid) ? (record.level || 0) : 0;
            const indent = indentLevel * indentSize;

            // Draw parent row
            this.drawDataRow(pdf, record, leafColumns, margin, yPosition, columnWidth, rowHeight, indent, options);
            yPosition += rowHeight;

            // For hierarchical grids, check if this record has child records
            if (isHierarchicalGrid) {
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
        maxLevel: number,
        xStart: number,
        yStart: number,
        baseColumnWidth: number,
        headerHeight: number,
        tableWidth: number,
        options: IgxPdfExporterOptions
    ): number {
        let yPosition = yStart;
        pdf.setFont('helvetica', 'bold');

        // Draw headers level by level (from top/parent to bottom/children)
        for (let level = 0; level <= maxLevel; level++) {
            // Get headers for this level
            const headersForLevel = columns.filter(col => {
                // Include multi-column headers at this level
                if (col.level === level && col.headerType === ExportHeaderType.MultiColumnHeader) {
                    return true;
                }
                // Include leaf column headers at this level
                if (col.level === level && col.headerType === ExportHeaderType.ColumnHeader) {
                    return true;
                }
                // For levels > 0, include leaf columns from earlier levels that need to span down
                if (level > 0 && col.level < level && col.headerType === ExportHeaderType.ColumnHeader) {
                    return true;
                }
                return false;
            }).filter(col => col.columnSpan > 0);

            if (headersForLevel.length === 0) continue;

            // Sort by startIndex to maintain order
            headersForLevel.sort((a, b) => a.startIndex - b.startIndex);

            // Draw background
            pdf.setFillColor(240, 240, 240);
            if (options.showTableBorders) {
                pdf.rect(xStart, yPosition, tableWidth, headerHeight, 'F');
            }

            // Draw each header in this level
            headersForLevel.forEach((col) => {
                const colSpan = col.columnSpan || 1;
                const width = baseColumnWidth * colSpan;
                const xPosition = xStart + (col.startIndex * baseColumnWidth);

                if (options.showTableBorders) {
                    pdf.rect(xPosition, yPosition, width, headerHeight);
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
                const textY = yPosition + headerHeight / 2 + options.fontSize / 3;

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
        const childColumns = this._ownersMap.get(childOwner)?.columns.filter(
            col => col.field && !col.skip && col.headerType === ExportHeaderType.ColumnHeader
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
        this.drawTableHeaders(pdf, childColumns, childTableX, yPosition, childColumnWidth, headerHeight, childTableWidth, options);
        yPosition += headerHeight;

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
                this.drawTableHeaders(pdf, childColumns, childTableX, yPosition, childColumnWidth, headerHeight, childTableWidth, options);
                yPosition += headerHeight;
            }

            // Draw the child record
            this.drawDataRow(pdf, childRecord, childColumns, childTableX, yPosition, childColumnWidth, rowHeight, 0, options);
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

        columns.forEach((col, index) => {
            const xPosition = xStart + (index * columnWidth);
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
        xStart: number,
        yPosition: number,
        columnWidth: number,
        rowHeight: number,
        indent: number,
        options: IgxPdfExporterOptions
    ): void {
        const isSummaryRecord = record.type === 'SummaryRecord';

        columns.forEach((col, index) => {
            const xPosition = xStart + (index * columnWidth);
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
