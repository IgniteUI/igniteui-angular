import { Directive, ElementRef, HostListener } from '@angular/core';
import { GridBaseAPIService } from './api.service';
import { GridType } from './common/grid.interface';

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
    private currentCellIndex: number;


    constructor(public api: GridBaseAPIService<any>, public element: ElementRef) {}

    get grid() {
        return this.api.grid;
    }

    @HostListener('keydown.Tab', [`$event`])
    @HostListener('keydown.Shift.Tab', [`$event`])
    public handleTab(event: KeyboardEvent): void {
        event.stopPropagation();
        if ((this.grid.rowEditTabs.last === this && !event.shiftKey) ||
            (this.grid.rowEditTabs.first === this && event.shiftKey)
        ) {
            this.move(event);
        }
    }

    @HostListener('keydown.Escape', [`$event`])
    public handleEscape(event: KeyboardEvent): void {
        this.grid.endEdit(false, event);
        this.grid.nativeElement.focus();
    }

    /**
     * Moves focus to first/last editable cell in the editable row and put the cell in edit mode.
     * If cell is out of view first scrolls to the cell
     * @param event keyboard event containing information about whether SHIFT key was pressed
     */
    private move(event: KeyboardEvent) {
        event.preventDefault();
        this.currentCellIndex = event.shiftKey ? this.grid.lastEditableColumnIndex : this.grid.firstEditableColumnIndex;
        this.grid.navigation.activeNode.row = this.grid.rowInEditMode.index;
        this.grid.navigation.activeNode.column = this.currentCellIndex;
        this.grid.navigateTo(this.grid.rowInEditMode.index, this.currentCellIndex, (obj) => {
            obj.target.setEditMode(true);
            this.grid.cdr.detectChanges();
        });
    }
}
