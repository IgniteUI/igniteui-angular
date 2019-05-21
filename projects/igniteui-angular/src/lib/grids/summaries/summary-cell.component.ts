import { Component, Input, HostBinding, HostListener, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { IgxColumnComponent } from '../column.component';
import { DataType } from '../../data-operations/data-util';
import { IgxGridSelectionService, ISelectionNode } from '../../core/grid-selection';

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

    constructor(private element: ElementRef, private selectionService: IgxGridSelectionService) {
    }

    @Input()
    @HostBinding('attr.data-rowIndex')
    public rowIndex: number;

    @HostBinding('attr.data-visibleIndex')
    get visibleColumnIndex(): number {
        return this.column.visibleIndex;
    }

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @HostBinding('attr.aria-describedby')
    public get describeby() {
        return `Summary_${this.column.field}`;
    }

    @HostBinding('class.igx-grid-summary--active')
    public focused: boolean;

    @HostListener('focus')
    public onFocus() {
        this.focused = true;
    }

    @HostListener('blur')
    public onBlur() {
        this.focused = false;
    }

    protected get selectionNode(): ISelectionNode {
        return {
            row: this.rowIndex,
            column: this.column.columnLayoutChild ? this.column.parent.visibleIndex : this.visibleColumnIndex,
            isSummaryRow: true
        };
    }

    @HostListener('keydown', ['$event'])
    dispatchEvent(event: KeyboardEvent) {
        // TODO: Refactor
        const key = event.key.toLowerCase();
        if (!this.isKeySupportedInCell(key)) { return; }
        event.preventDefault();
        event.stopPropagation();
        const shift = event.shiftKey;
        const ctrl = event.ctrlKey;
        this.selectionService.keyboardState.shift = shift && !(key === 'tab');

        if (ctrl && (key === 'arrowup' || key === 'arrowdown' || key === 'up'
                        || key  === 'down'  || key === 'end' || key === 'home')) { return; }
        const row = this.getRowElementByIndex(this.rowIndex);
        switch (key) {
            case 'tab':
                if (shift) {
                    this.grid.navigation.performShiftTabKey(row, this.selectionNode);
                    break;
                }
                this.grid.navigation.performTab(row, this.selectionNode);
                break;
            case 'arrowleft':
            case 'home':
            case 'left':
                if (ctrl || key === 'home') {
                    this.grid.navigation.onKeydownHome(this.rowIndex, true);
                    break;
                }
                this.grid.navigation.onKeydownArrowLeft(this.nativeElement, this.selectionNode);
                break;
            case 'end':
            case 'arrowright':
            case 'right':
                if (ctrl || key === 'end') {
                    this.grid.navigation.onKeydownEnd(this.rowIndex, true);
                    break;
                }
                this.grid.navigation.onKeydownArrowRight(this.nativeElement, this.selectionNode);
                break;
            case 'arrowup':
            case 'up':
                if (this.rowIndex !== 0) {
                    this.grid.navigation.navigateUp(row, this.selectionNode);
                }
                break;
            case 'arrowdown':
            case 'down':
                if (this.rowIndex !== 0) {
                    this.grid.navigation.navigateDown(row, this.selectionNode);
                }
                break;
        }
    }

    @HostBinding('style.min-width')
    @HostBinding('style.max-width')
    @HostBinding('style.flex-basis')
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
        return this.column.grid.defaultRowHeight;
    }

    /**
    * @hidden
    */
    public get grid() {
        return (this.column.grid as any);
    }

    private getRowElementByIndex(rowIndex) {
        const summaryRows = this.grid.summariesRowList.toArray();
        return summaryRows.find((sr) => sr.dataRowIndex === rowIndex).nativeElement;
    }

    private isKeySupportedInCell(key) {
        return ['down', 'up', 'left', 'right', 'arrowdown', 'arrowup', 'arrowleft', 'arrowright',
        'home', 'end', 'tab', 'space', ' ', 'spacebar'].indexOf(key) !== -1;

    }

    public translateSummary(summary: IgxSummaryResult): string {
        return this.grid.resourceStrings[`igx_grid_summary_${summary.key}`] || summary.label;
    }
}
