import { Component, Input, HostBinding, HostListener, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { IgxColumnComponent } from '../column.component';
import { DataType } from '../../data-operations/data-util';
import { IgxGridSelectionService, ISelectionNode } from '../../core/grid-selection';
import { SUPPORTED_KEYS } from '../../core/utils';

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
        const ctrl = event.ctrlKey;
        const shift = event.shiftKey;

        if (!SUPPORTED_KEYS.has(key)) {
            return;
        }
        event.stopPropagation();
        const args = { targetType: 'summaryCell', target: this, event: event, cancel: false };
        this.grid.onGridKeydown.emit(args);
        if (args.cancel) {
            return;
        }
        event.preventDefault();

        if (!this.isKeySupportedInCell(key, ctrl)) { return; }

        this.selectionService.keyboardState.shift = shift && !(key === 'tab');
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
                    this.grid.navigation.navigateUp(row, this.selectionNode);
                break;
            case 'arrowdown':
            case 'down':
                    this.grid.navigation.navigateDown(row, this.selectionNode);
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
        return this.column.grid.defaultSummaryHeight;
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

    private isKeySupportedInCell(key, ctrl) {
        if (ctrl) {
           return ['arrowup', 'arrowdown', 'up', 'down', 'end', 'home'].indexOf(key) === -1;
        }
        return ['down', 'up', 'left', 'right', 'arrowdown', 'arrowup', 'arrowleft', 'arrowright', 'home', 'end', 'tab'].indexOf(key) !== -1;
    }

    public translateSummary(summary: IgxSummaryResult): string {
        return this.grid.resourceStrings[`igx_grid_summary_${summary.key}`] || summary.label;
    }
}
