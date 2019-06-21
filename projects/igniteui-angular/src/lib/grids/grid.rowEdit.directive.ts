import { Directive, ElementRef, forwardRef, HostListener, Inject, QueryList } from '@angular/core';
import { IgxGridBaseComponent } from './grid-base.component';
import { IgxGridComponent } from './grid';

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
        @Inject(forwardRef(() => IgxGridComponent)) private grid: IgxGridComponent,
        public element: ElementRef) {
    }

    @HostListener('keydown.Tab', [`$event`])
    @HostListener('keydown.Shift.Tab', [`$event`])
    public handleTab(event: KeyboardEvent): void {
        event.stopPropagation();
        if ((this.allTabs.last === this && !event.shiftKey) ||
            (this.allTabs.first === this && event.shiftKey)
        ) {
            this.move(event);
        }
    }

    @HostListener('keydown.Escape', [`$event`])
    public handleEscape(event: KeyboardEvent): void {
        this.grid.endEdit(false, event);
        const activeNode = this.grid.selectionService.activeElement;
        //  on right click activeNode is deleted, so we may have no one
        if (activeNode) {
            const cell = this.grid.navigation.getCellElementByVisibleIndex(activeNode.row, activeNode.column);
            cell.focus();
        }
    }

    /**
     * Moves focus to first/last editable cell in the editable row and put the cell in edit mode.
     * If cell is out of view first scrolls to the cell
     * @param event keyboard event containing information about whether SHIFT key was pressed
     */
    private move(event: KeyboardEvent) {
        event.preventDefault();
        const cellIndex = event.shiftKey ? this.grid.lastEditableColumnIndex : this.grid.firstEditableColumnIndex;
        ////  this will not work if targetCell is null and we have multi row layout
        // const targetCell = this.grid.rowInEditMode.cells.find(e => e.visibleColumnIndex === cellIndex);
        // const scrollIndex = this.grid.hasColumnLayouts ? targetCell.column.parent.visibleIndex : targetIndex;
        if (!this.grid.navigation.isColumnFullyVisible(cellIndex)) {
            this.grid.navigation.performHorizontalScrollToCell(
                this.grid.rowInEditMode.index, cellIndex, false, this.activateCell, { cellIndex, grid: this.grid });
        } else {
            this.activateCell({ cellIndex, grid: this.grid });
        }
    }

    /**
     * Sets the cell in edit mode and focus its native element
     * @param cellIndex index of the cell to activate
     */
    private activateCell(params: { cellIndex: number, grid: IgxGridBaseComponent }): void {
        const cell = params.grid.rowInEditMode.cells.find(e => e.visibleColumnIndex === params.cellIndex);
        cell.setEditMode(true);
        cell.nativeElement.focus();
    }

}
