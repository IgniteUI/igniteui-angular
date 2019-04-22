import { Directive, ElementRef, HostListener, QueryList } from '@angular/core';
import { first } from 'rxjs/operators';
import { IgxGridType } from './grid-types';
import { GridBaseAPIService } from './api.service';

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

    get grid(): IgxGridType {
        return this.gridAPI.grid;
    }

    get navigationService() {
        return this.gridAPI.grid.navigation;
    }

    get nativeElement(): HTMLElement {
        return this.element.nativeElement;
    }

    private get tabs(): QueryList<IgxRowEditTabStopDirective> {
        return this.grid.rowEditTabs;
    }

    constructor(public element: ElementRef, private gridAPI: GridBaseAPIService<any>) {
    }


    @HostListener('keydown.Tab', [`$event`])
    @HostListener('keydown.Shift.Tab', [`$event`])
    public handleTab(event: KeyboardEvent): void {
        event.stopPropagation();
        if (this.tabs.length > 1) {
            if ((this.tabs.last ===  this && !event.shiftKey) ||
                (this.tabs.first ===  this && event.shiftKey)
            ) {
                this.move(event);
            }
        } else {
            this.move(event);
        }
    }

    private focusNextCell(rowIndex: number, cellIndex: number): void {
        this.grid.parentVirtDir.onChunkLoad.pipe(first()).subscribe(() =>
            this.grid.rowInEditMode.cells.find(c => c.visibleColumnIndex === cellIndex).nativeElement.focus()
        );
    }
    private move(event: KeyboardEvent) {
        event.preventDefault();
        const horizontalScroll = this.grid.parentVirtDir.getHorizontalScroll();
        const targetIndex = event.shiftKey ? this.grid.lastEditableColumnIndex : this.grid.firstEditableColumnIndex;
        const targetCell = this.grid.rowInEditMode.cells.find(e => e.visibleColumnIndex === targetIndex);
        if (!targetCell ||
            !this.navigationService.isColumnFullyVisible(targetIndex)
            || !this.navigationService.isColumnLeftFullyVisible(targetIndex)) {
            this.focusNextCell(this.grid.rowInEditMode.index, targetIndex);
            horizontalScroll.scrollLeft =
            this.grid.rowInEditMode.virtDirRow.getColumnScrollLeft(this.navigationService.getColumnUnpinnedIndex(targetIndex));
        } else {
            targetCell.nativeElement.focus();
        }
    }
}
