import { Directive, ElementRef, forwardRef, HostListener, Inject, QueryList } from '@angular/core';
import { IgxGridComponent } from './grid.component';
import { IgxGridCellComponent } from './cell.component';
import { take } from 'rxjs/operators';

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
    private focusNextCell(rowIndex, cellIndex) {
        const grid = this.grid as any;
        grid.parentVirtDir.onChunkLoad.pipe(take(1)).subscribe(() => {
            grid.rowInEditMode.cells.find(c => c.visibleColumnIndex === cellIndex).element.nativeElement.focus();
        });
    }
    private move(event: KeyboardEvent) {
        event.preventDefault();
        const horizontalScroll = this.grid.parentVirtDir.getHorizontalScroll();
        const targetIndex = event.shiftKey ? this.grid.lastEditableColumnIndex : this.grid.firstEditableColumnIndex;
        const targetCell = this.grid.rowInEditMode.cells.find(e => e.visibleColumnIndex === targetIndex);
        if (!targetCell) {
            this.focusNextCell(this.grid.rowInEditMode.index, targetIndex);
            horizontalScroll.scrollLeft = event.shiftKey ? horizontalScroll.scrollWidth : 0;
        } else {
            targetCell._updateCellSelectionStatus(true, event);
            targetCell.inEditMode = true;
            targetCell.nativeElement.focus();
        }
    }
}
