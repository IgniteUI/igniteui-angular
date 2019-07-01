import { Directive, ElementRef, forwardRef, HostListener, Inject, QueryList } from '@angular/core';
import { IgxGridBaseComponent } from './grid-base.component';
import { first, tap } from 'rxjs/operators';

/** @hidden */
@Directive({
    selector: '[igxRowEdit]'
})
export class IgxRowEditTemplateDirective { }

/** @hidden */
@Directive({
    selector: '[igxRowEditText]'
})
export class IgxRowEditTextDirective { }

/** @hidden */
@Directive({
    selector: '[igxRowEditActions]'
})
export class IgxRowEditActionsDirective { }


// TODO: Refactor circular ref, deps and logic
/** @hidden */
@Directive({
    selector: `[igxRowEditTabStop]`
})
export class IgxRowEditTabStopDirective {
    private get allTabs(): QueryList<IgxRowEditTabStopDirective> {
        return this.grid.rowEditTabs;
    }

    constructor(
        @Inject(forwardRef(() => IgxGridBaseComponent)) private grid: IgxGridBaseComponent,
        public element: ElementRef) {
        }

    @HostListener('keydown.Tab', [`$event`])
    @HostListener('keydown.Shift.Tab', [`$event`])
    public handleTab(event: KeyboardEvent): void {
        event.stopPropagation();
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
        grid.parentVirtDir.onChunkLoad.pipe(first(), tap(() => grid.markForCheck())).subscribe(() => {
            grid.rowInEditMode.cells.find(c => c.visibleColumnIndex === cellIndex).element.nativeElement.focus();
        });
    }
    private move(event: KeyboardEvent) {
        event.preventDefault();
        const horizontalScroll = this.grid.parentVirtDir.getHorizontalScroll();
        const targetIndex = event.shiftKey ? this.grid.lastEditableColumnIndex : this.grid.firstEditableColumnIndex;
        const targetCell = this.grid.rowInEditMode.cells.find(e => e.visibleColumnIndex === targetIndex);
        const scrollIndex = this.grid.hasColumnLayouts ? targetCell.column.parent.visibleIndex : targetIndex;
        if (!targetCell ||
            !this.grid.navigation.isColumnFullyVisible(targetIndex)
            || !this.grid.navigation.isColumnLeftFullyVisible(targetIndex)) {
            this.focusNextCell(this.grid.rowInEditMode.index, targetIndex);
            horizontalScroll.scrollLeft =
            this.grid.rowInEditMode.virtDirRow.getColumnScrollLeft(this.grid.navigation.getColumnUnpinnedIndex(scrollIndex));
        } else {
            targetCell.nativeElement.focus();
        }
    }
}
