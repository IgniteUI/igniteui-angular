import { Component, Input, HostBinding, HostListener, ChangeDetectionStrategy, ElementRef, TemplateRef, booleanAttribute } from '@angular/core';
import {
    IgxSummaryOperand
} from './grid-summary';
import { NgTemplateOutlet } from '@angular/common';
import { ISelectionNode } from '../common/types';
import { GridTypeBase,  ColumnType, GridColumnDataType, IgxSummaryResult, trackByIdentity, BaseFormatter } from 'igniteui-angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-summary-cell',
    templateUrl: './summary-cell.component.html',
    imports: [NgTemplateOutlet]
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

    @Input()
    public locale;

    @Input()
    public gridResourceStrings;

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
    public get grid(): GridTypeBase {
        return this.column.grid;
    }

    /**
     * @hidden
     */
    public get i18nFormatter(): BaseFormatter {
        return this.grid.i18nFormatter;
    }

    /**
     * @hidden @internal
     */
    public get currencyCode(): string {
        return this.i18nFormatter.getCurrencyCode(this.locale, this.column.pipeArgs.currencyCode);
    }

    /** cached single summary res after filter resets collection */
    protected trackSummaryResult = trackByIdentity;

    public translateSummary(summary: IgxSummaryResult): string {
        return this.gridResourceStrings[`igx_grid_summary_${summary.key}`] || summary.label;
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
        const locale = this.locale;

        if (summary.key === 'count') {
            return this.i18nFormatter.formatNumber(summary.summaryResult, locale)
        }

        if (summary.defaultFormatting) {
            switch (this.column.dataType) {
                case GridColumnDataType.Number:
                    return this.i18nFormatter.formatNumber(summary.summaryResult, locale, args.digitsInfo);
                case GridColumnDataType.Date:
                case GridColumnDataType.DateTime:
                case GridColumnDataType.Time:
                    return this.i18nFormatter.formatDate(summary.summaryResult, args.format, locale, args.timezone);
                case GridColumnDataType.Currency:
                    return this.i18nFormatter.formatCurrency(summary.summaryResult, locale, args.display, this.currencyCode, args.digitsInfo);
                case GridColumnDataType.Percent:
                    return this.i18nFormatter.formatPercent(summary.summaryResult, locale, args.digitsInfo);
            }
        }
        return summary.summaryResult;
    }
}
