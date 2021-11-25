import { Component, Input, HostBinding, HostListener, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import {
    IgxSummaryOperand,
    IgxSummaryResult
} from './grid-summary';
import { GridColumnDataType } from '../../data-operations/data-util';
import { getLocaleCurrencyCode } from '@angular/common';
import { ISelectionNode } from '../common/types';
import { ColumnType } from '../common/grid.interface';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-summary-cell',
    templateUrl: './summary-cell.component.html'
})
export class IgxSummaryCellComponent {

    @Input()
    public summaryResults: IgxSummaryResult[];

    @Input()
    public column: ColumnType;

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

    public translateSummary(summary: IgxSummaryResult): string {
        return this.grid.resourceStrings[`igx_grid_summary_${summary.key}`] || summary.label;
    }

    /**
     * @hidden @internal
     */
    public isNumberColumn(): boolean {
        return this.column.dataType === GridColumnDataType.Number;
    }

    /**
     * @hidden @internal
     */
    public isDateKindColumn(): boolean {
        return this.column.dataType === GridColumnDataType.Date ||
               this.column.dataType === GridColumnDataType.DateTime ||
               this.column.dataType === GridColumnDataType.Time;
    }

    /**
     * @hidden @internal
     */
    public isCurrencyColumn(): boolean {
        return this.column.dataType === GridColumnDataType.Currency;
    }

    /**
     * @hidden @internal
     */
    public isPercentColumn(): boolean {
        return this.column.dataType === GridColumnDataType.Percent;
    }
}
