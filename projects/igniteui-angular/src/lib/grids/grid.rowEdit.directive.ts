import { Directive, ElementRef, Host, HostListener } from '@angular/core';
import { GridBaseAPIService } from './api.service';

/** @hidden @internal */
@Directive({
    selector: '[igxRowEdit]'
})
export class IgxRowEditTemplateDirective { }

/** @hidden @internal */
@Directive({
    selector: '[igxRowEditText]'
})
export class IgxRowEditTextDirective { }

/** @hidden @internal */
@Directive({
    selector: '[igxRowAddText]'
})
export class IgxRowAddTextDirective { }

/** @hidden @internal */
@Directive({
    selector: '[igxRowEditActions]'
})
export class IgxRowEditActionsDirective { }


// TODO: Refactor circular ref, deps and logic
/** @hidden @internal */
@Directive({
    selector: `[igxRowEditTabStop]`
})
export class IgxRowEditTabStopDirective {
    private currentCellIndex: number;

    public get grid() {
        return this.api.grid;
    }

    constructor(public api: GridBaseAPIService<any>, public element: ElementRef) {}

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
        this.grid.crudService.endEdit(false, event);
        this.grid.tbody.nativeElement.focus();
    }

    @HostListener('keydown.Enter', ['$event'])
    public handleEnter(event: KeyboardEvent): void {
        event.stopPropagation();
    }

    /**
     * Moves focus to first/last editable cell in the editable row and put the cell in edit mode.
     * If cell is out of view first scrolls to the cell
     *
     * @param event keyboard event containing information about whether SHIFT key was pressed
     */
    private move(event: KeyboardEvent) {
        event.preventDefault();
        this.currentCellIndex = event.shiftKey ? this.grid.lastEditableColumnIndex : this.grid.firstEditableColumnIndex;
        this.grid.navigation.activeNode.row = this.grid.crudService.rowInEditMode.index;
        this.grid.navigation.activeNode.column = this.currentCellIndex;
        this.grid.navigateTo(this.grid.crudService.rowInEditMode.index, this.currentCellIndex, (obj) => {
            obj.target.activate(event);
            this.grid.cdr.detectChanges();
        });
    }
}
