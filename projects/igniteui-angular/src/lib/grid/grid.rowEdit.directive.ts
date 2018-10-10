import { Directive, ElementRef, forwardRef, HostListener, Inject, QueryList } from '@angular/core';
import { IgxGridComponent } from './grid.component';
import { IgxGridCellComponent } from './cell.component';

@Directive({
    selector: '[igxRowEdit]'
})
export class IgxRowEditTemplateDirective {
    constructor(public element: ElementRef) {}
}

@Directive({
    selector: `[igxRowEditTabStop]`
})
export class IgxRowEditTabStopDirective {
    private get allTabs(): QueryList<IgxRowEditTabStopDirective> {
        return this.grid.rowEditTabs;
    }
    constructor(@Inject(forwardRef(() => IgxGridComponent)) public grid: IgxGridComponent, public element: ElementRef) {}
    @HostListener('keydown.Tab', [`$event`])
    @HostListener('keydown.Shift.Tab', [`$event`])
    public handleTab(event: KeyboardEvent): void {
        if (this.allTabs.length > 1) {
            if ((this.allTabs.last ===  this && !event.shiftKey) ||
                (this.allTabs.first ===  this && event.shiftKey)
            ) {
                this.move(event);
            }
        } else {
            this.move(event);
        }
    }
    private move(event: KeyboardEvent) {
        event.preventDefault();
        const horizontalScroll = this.grid.parentVirtDir.getHorizontalScroll();
        const targetIndex = event.shiftKey ? this.grid.lastEditableColumnIndex : this.grid.firstEditableColumnIndex;
        const targetCell = this.grid.rowInEditMode.cells.find(e => e.columnIndex === targetIndex);
        if (!targetCell) {
            (<any>this.grid)._focusNextCell(this.grid.rowInEditMode.index, targetIndex, event.shiftKey ? 'right' : 'left', event);
            this.grid.rowInEditMode.cells.first.inEditMode = true;
            horizontalScroll.scrollLeft = event.shiftKey ? horizontalScroll.scrollWidth : 0;
        } else {
            targetCell._updateCellSelectionStatus(true, event);
            targetCell.inEditMode = true;
            targetCell.nativeElement.focus();
        }
    }
}
