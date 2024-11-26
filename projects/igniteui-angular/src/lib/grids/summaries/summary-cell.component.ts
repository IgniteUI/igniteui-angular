import { Component, Input, HostBinding, HostListener, ChangeDetectionStrategy, ElementRef, TemplateRef, booleanAttribute } from '@angular/core';
import {
    IgxSummaryOperand,
    IgxSummaryResult
} from './grid-summary';
import { GridColumnDataType } from '../../data-operations/data-util';
import { formatCurrency, formatDate, formatNumber, formatPercent, getLocaleCurrencyCode, getLocaleCurrencySymbol, NgIf, NgTemplateOutlet, NgFor } from '@angular/common';
import { ISelectionNode } from '../common/types';
import { ColumnType } from '../common/grid.interface';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-summary-cell',
    templateUrl: './summary-cell.component.html',
    imports: [NgIf, NgTemplateOutlet, NgFor]
})
export class IgxSummaryCellComponent {

    @Input()
    public summaryResults: IgxSummaryResult[];

    @Input()
    public column: ColumnType;

    @Input()
    public firstCellIndentation = 0;

    @Input({ transform: booleanAttribute })
    public hasSummary = false;

    @Input()
    public summaryFormatter: (summaryResult: IgxSummaryResult, summaryOperand: IgxSummaryOperand) => any;

    @Input()
    public summaryTemplate: TemplateRef<any>;

    /** @hidden */
    @Input()
    @HostBinding('class.igx-grid-summary--active')
    public active: boolean;

    @Input()
    @HostBinding('attr.data-rowIndex')
    public rowIndex: number;

    constructor(private element: ElementRef) {
    }

    @HostBinding('attr.data-visibleIndex')
    public get visibleColumnIndex(): number {
        return this.column.visibleIndex;
    }

    @HostBinding('attr.id')
    public get attrCellID() {
        return `${this.grid.id}_${this.rowIndex}_${this.visibleColumnIndex}`;
    }

    @HostListener('pointerdown')
    public activate() {
        const currNode = this.grid.navigation.activeNode;
        if (currNode && this.rowIndex === currNode.row && this.visibleColumnIndex === currNode.column) {
            return;
        }

        this.grid.navigation.setActiveNode({ row: this.rowIndex, column: this.visibleColumnIndex }, 'summaryCell');
        this.grid.cdr.detectChanges();
    }

    protected get selectionNode(): ISelectionNode {
        return {
            row: this.rowIndex,
            column: this.column.columnLayoutChild ? this.column.parent.visibleIndex : this.visibleColumnIndex,
            isSummaryRow: true
        };
    }

    public get width() {
        return this.column.getCellWidth();
    }

    public get nativeElement(): any {
        return this.element.nativeElement;
    }

    public get columnDatatype(): GridColumnDataType {
        return this.column.dataType;
    }

    public get itemHeight() {
        return this.column.grid.defaultSummaryHeight;
    }

    /**
     * @hidden
     */
    public get grid() {
        return (this.column.grid as any);
    }

    /**
     * @hidden @internal
     */
    public get currencyCode(): string {
        return this.column.pipeArgs.currencyCode ?
            this.column.pipeArgs.currencyCode : getLocaleCurrencyCode(this.grid.locale);
    }

    /**
     * @hidden @internal
     */
    public get currencySymbol(): string {
        return this.column.pipeArgs.display ?
            this.column.pipeArgs.display : getLocaleCurrencySymbol(this.grid.locale);
    }

    public translateSummary(summary: IgxSummaryResult): string {
        return this.grid.resourceStrings[`igx_grid_summary_${summary.key}`] || summary.label;
    }

    /**
     * @hidden @internal
     */
    public formatSummaryResult(summary: IgxSummaryResult): string {
        if (summary.summaryResult === undefined || summary.summaryResult === null || summary.summaryResult === '') {
            return '';
        }

        if (this.summaryFormatter) {
            return this.summaryFormatter(summary, this.column.summaries);
        }

        const args = this.column.pipeArgs;
        const locale = this.grid.locale;

        if (summary.key === 'count') {
            return formatNumber(summary.summaryResult, locale)
        }

        if (summary.defaultFormatting) {
            switch (this.column.dataType) {
                case GridColumnDataType.Number:
                    return formatNumber(summary.summaryResult, locale, args.digitsInfo);
                case GridColumnDataType.Date:
                case GridColumnDataType.DateTime:
                case GridColumnDataType.Time:
                    return formatDate(summary.summaryResult, args.format, locale, args.timezone);
                case GridColumnDataType.Currency:
                    return formatCurrency(summary.summaryResult, locale, this.currencySymbol, this.currencyCode, args.digitsInfo);
                case GridColumnDataType.Percent:
                    return formatPercent(summary.summaryResult, locale, args.digitsInfo);
            }
        }
        return summary.summaryResult;
    }
}
