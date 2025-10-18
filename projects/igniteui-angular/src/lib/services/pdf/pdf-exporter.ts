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
        const columns = defaultOwner?.columns.filter(col => col.field && !col.skip && col.headerType === ExportHeaderType.ColumnHeader) || [];

        if (columns.length === 0 && data.length > 0) {
            // If no columns are defined, use the keys from the first data record
            const firstDataElement = data[0];
            const keys = Object.keys(firstDataElement.data);
            
            keys.forEach((key) => {
                columns.push({
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
        const columnWidth = usableWidth / columns.length;
        const rowHeight = 20;
        const headerHeight = 25;
        const indentSize = 15; // Indentation per level for hierarchical data
        
        let yPosition = margin;

        // Set font
        pdf.setFontSize(options.fontSize);

        // Draw table headers
        pdf.setFont('helvetica', 'bold');
        pdf.setFillColor(240, 240, 240);
        
        if (options.showTableBorders) {
            pdf.rect(margin, yPosition, usableWidth, headerHeight, 'F');
        }

        columns.forEach((col, index) => {
            const xPosition = margin + (index * columnWidth);
            const headerText = col.header || col.field;
            
            if (options.showTableBorders) {
                pdf.rect(xPosition, yPosition, columnWidth, headerHeight);
            }
            
            // Center text in cell
            const textWidth = pdf.getTextWidth(headerText);
            const textX = xPosition + (columnWidth - textWidth) / 2;
            const textY = yPosition + headerHeight / 2 + options.fontSize / 3;
            
            pdf.text(headerText, textX, textY);
        });

        yPosition += headerHeight;

        // Draw data rows
        pdf.setFont('helvetica', 'normal');

        data.forEach((record) => {
            // Skip hidden records (collapsed hierarchy)
            if (record.hidden) {
                return;
            }

            // Check if we need a new page
            if (yPosition + rowHeight > pageHeight - margin) {
                pdf.addPage();
                yPosition = margin;
            }

            // Calculate indentation for hierarchical records
            const isHierarchical = record.type === 'TreeGridRecord' || record.type === 'HierarchicalGridRecord';
            const indentLevel = isHierarchical ? (record.level || 0) : 0;
            const indent = indentLevel * indentSize;

            columns.forEach((col, index) => {
                const xPosition = margin + (index * columnWidth);
                let cellValue = record.data[col.field];
                
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
                const textIndent = (index === 0 && isHierarchical) ? indent : 0;
                
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

            yPosition += rowHeight;
        });

        // Save the PDF
        this.saveFile(pdf, options.fileName);
        this.exportEnded.emit({ pdf });
        done();
    }

    private saveFile(pdf: jsPDF, fileName: string): void {
        const blob = pdf.output('blob');
        ExportUtilities.saveBlobToFile(blob, fileName);
    }
}
