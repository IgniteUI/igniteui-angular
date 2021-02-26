import { Component, Input, HostBinding, HostListener, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { IgxCurrencySummaryOperand,
         IgxDateSummaryOperand,
         IgxNumberSummaryOperand,
         IgxPercentSummaryOperand,
         IgxSummaryResult } from './grid-summary';
import { IgxColumnComponent } from '../columns/column.component';
import { DataType } from '../../data-operations/data-util';
import { ISelectionNode } from '../selection/selection.service';
import { CurrencyPipe, DatePipe, DecimalPipe, getLocaleCurrencyCode, PercentPipe } from '@angular/common';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-summary-cell',
    templateUrl: './summary-cell.component.html'
})
export class IgxSummaryCellComponent {

    @Input()
    public summaryResults: IgxSummaryResult[];

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public firstCellIndentation = 0;

    @Input()
    public hasSummary = false;

    @Input()
    public density;

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
    get visibleColumnIndex(): number {
        return this.column.visibleIndex;
    }

    @HostBinding('attr.id')
    public get attrCellID() {
        return `${this.grid.id}_${this.rowIndex}_${ this.visibleColumnIndex}`;
    }

    @HostListener('pointerdown')
    public activate() {
        const currNode = this.grid.navigation.activeNode;
        if (currNode && this.rowIndex === currNode.row && this.visibleColumnIndex === currNode.column) {
            return;
        }

        this.grid.navigation.setActiveNode({row: this.rowIndex, column: this.visibleColumnIndex}, 'summaryCell');
        this.grid.cdr.detectChanges();
    }

    protected get selectionNode(): ISelectionNode {
        return {
            row: this.rowIndex,
            column: this.column.columnLayoutChild ? this.column.parent.visibleIndex : this.visibleColumnIndex,
            isSummaryRow: true
        };
    }

    get width() {
        return this.column.getCellWidth();
    }

    get nativeElement(): any {
        return this.element.nativeElement;
    }

    get columnDatatype(): DataType {
        return this.column.dataType;
    }

    get itemHeight() {
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
    public isDateSummary(summaryKey: string): boolean {
        return summaryKey === 'latest' || summaryKey === 'earliest';
    }

    public translateSummary(summary: IgxSummaryResult): string {
        return this.grid.resourceStrings[`igx_grid_summary_${summary.key}`] || summary.label;
    }

    /**
     * @hidden @internal
     */
    public appySummaryPipe(summary: IgxSummaryResult): any {
        const pipeArgs = this.column.pipeArgs;
        const locale = this.grid.locale;
        if (summary.key === 'count') {
            const pipe = new DecimalPipe(locale);
            return pipe.transform(summary.summaryResult);
        }
        if(this.column.summaries instanceof IgxNumberSummaryOperand) {
            const pipe = new DecimalPipe(locale);
            return pipe.transform(summary.summaryResult, pipeArgs.digitsInfo);
        }
        if(this.column.summaries instanceof IgxDateSummaryOperand) {
            const pipe = new DatePipe(locale);
            return pipe.transform(summary.summaryResult, pipeArgs.format, pipeArgs.timezone);
        }
        if(this.column.summaries instanceof IgxCurrencySummaryOperand) {
            const currencyCode = pipeArgs.currencyCode
                ? pipeArgs.currencyCode
                : getLocaleCurrencyCode(locale);
            const pipe = new CurrencyPipe(locale, currencyCode);
            return pipe.transform(summary.summaryResult, currencyCode, pipeArgs.display, pipeArgs.digitsInfo);
        }
        if(this.column.summaries instanceof IgxPercentSummaryOperand) {
            const pipe = new PercentPipe(locale);
            return pipe.transform(summary.summaryResult, pipeArgs.digitsInfo);
        }
        return  summary.summaryResult;
    }
}
