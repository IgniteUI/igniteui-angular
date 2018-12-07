import { Component, Input, HostBinding, HostListener, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { IgxColumnComponent } from '../column.component';
import { DisplayDensity } from '../../core/density';
import { DataType } from '../../data-operations/data-util';

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

    constructor(private element: ElementRef) {
    }

    @HostBinding('class')
    get styleClasses(): string {
        const defaultClasses = ['igx-grid-summary--cell'];
        const classList = {
            'igx-grid-summary': this.density === DisplayDensity.comfortable,
            'igx-grid-summary--fw': this.column.width !== null,
            'igx-grid-summary--empty': !this.column.hasSummary,
            'igx-grid-summary--compact': this.density === DisplayDensity.compact,
            'igx-grid-summary--cosy': this.density === DisplayDensity.cosy,
            'igx-grid-summary--pinned': this.column.pinned,
            'igx-grid-summary--pinned-last': this.column.isLastPinned
        };
        Object.entries(classList).forEach(([className, value]) => {
            if (value) {
                defaultClasses.push(className);
            }
        });
        return defaultClasses.join(' ');
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

    get nativeElement(): any {
        return this.element.nativeElement;
    }

    @HostListener('keydown', ['$event'])
    dispatchEvent(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (!this.isKeySupportedInCell(key)) { return; }
        const shift = event.shiftKey;
        const ctrl = event.ctrlKey;
        event.preventDefault();
        event.stopPropagation();
        if (this.rowIndex === 0 &&
            this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex === this.visibleColumnIndex) {
                return;

        }
        if (ctrl && (key === 'arrowup' || key === 'up' || key  === 'down' || key === 'arrowdown')) { return; }
        const row = this.getRowElementByIndex(this.rowIndex);
        switch (key) {
            case 'tab':
                if (shift) {
                    this.grid.navigation.performShiftTabKey(row, this.rowIndex, this.visibleColumnIndex, true);
                    break;
                }
                this.grid.navigation.performTab(row, this.rowIndex, this.visibleColumnIndex, true);
                break;
            case 'arrowleft':
            case 'home':
            case 'left':
                if (ctrl || key === 'home') {
                    this.grid.navigation.onKeydownHome(this.rowIndex, true);
                    break;
                }
                this.grid.navigation.onKeydownArrowLeft(this.nativeElement, this.rowIndex, this.visibleColumnIndex, true);
                break;
            case 'end':
            case 'arrowright':
            case 'right':
                if (ctrl || key === 'end') {
                    this.grid.navigation.onKeydownEnd(this.rowIndex, true);
                    break;
                }
                this.grid.navigation.onKeydownArrowRight(this.nativeElement, this.rowIndex, this.visibleColumnIndex, true);
                break;
            case 'arrowup':
            case 'up':
                this.grid.navigation.navigateUp(row, this.rowIndex, this.visibleColumnIndex);
                break;
            case 'arrowdown':
            case 'down':
                this.grid.navigation.navigateDown(row, this.rowIndex, this.visibleColumnIndex);
                break;
        }
    }

    @HostBinding('style.min-width')
    @HostBinding('style.max-width')
    @HostBinding('style.flex-basis')
    get width() {
        const hasVerticalScroll = !this.grid.verticalScrollContainer.dc.instance.notVirtual;
        const colWidth = this.column.width;
        const isPercentageWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1;

        if (colWidth && !isPercentageWidth) {
            let cellWidth = this.isLastUnpinned && hasVerticalScroll ?
                parseInt(colWidth, 10) - 18 + '' : colWidth;

            if (typeof cellWidth !== 'string' || cellWidth.endsWith('px') === false) {
                cellWidth += 'px';
            }

            return cellWidth;
        } else {
            return colWidth;
        }
    }

    get isLastUnpinned() {
        const unpinnedColumns = this.grid.unpinnedColumns;
        return unpinnedColumns[unpinnedColumns.length - 1] === this.column;
    }

    get columnDatatype(): DataType {
        return this.column.dataType;
    }

    get itemHeight() {
        return this.column.grid.defaultRowHeight;
    }

    private get grid() {
        return (this.column.grid as any);
    }

    private getRowElementByIndex(rowIndex) {
        return this.grid.nativeElement.querySelector(`igx-grid-summary-row[data-rowindex="${rowIndex}"]`);
    }

    private isKeySupportedInCell(key) {
        return ['down', 'up', 'left', 'right', 'arrowdown', 'arrowup', 'arrowleft', 'arrowright',
        'home', 'end', 'tab'].indexOf(key) !== -1;

    }
}
