import { Component, Input, HostBinding, HostListener, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { IgxCurrencySummaryOperand,
         IgxDateSummaryOperand,
         IgxNumberSummaryOperand,
         IgxPercentSummaryOperand,
         IgxSummaryOperand,
         IgxSummaryResult } from './grid-summary';
import { IgxColumnComponent } from '../columns/column.component';
import { DataType } from '../../data-operations/data-util';
import { ISelectionNode } from '../selection/selection.service';
import { getLocaleCurrencyCode } from '@angular/common';
import { IColumnPipeArgs } from '../columns/interfaces';

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

    @Input()
    public summaryFormatter: (summaryResult: IgxSummaryResult, summaryOperand: IgxSummaryOperand) => any;

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
    public get currencyCode(): string {
        return this.column.pipeArgs.currencyCode ?
            this.column.pipeArgs.currencyCode : getLocaleCurrencyCode(this.grid.locale);
    }

    public translateSummary(summary: IgxSummaryResult): string {
        return this.grid.resourceStrings[`igx_grid_summary_${summary.key}`] || summary.label;
    }

    /**
     * @hidden @internal
     */
    public isNumberOperand(): boolean {
        return this.column.summaries?.constructor === IgxNumberSummaryOperand;
    }

    /**
     * @hidden @internal
     */
    public isDateOperand(): boolean {
        return this.column.summaries?.constructor === IgxDateSummaryOperand;
    }

    /**
     * @hidden @internal
     */
    public isCurrencyOperand(): boolean {
        return this.column.summaries?.constructor === IgxCurrencySummaryOperand;
    }

    /**
     * @hidden @internal
     */
    public isPercentOperand(): boolean {
        return this.column.summaries?.constructor === IgxPercentSummaryOperand;
    }
}
