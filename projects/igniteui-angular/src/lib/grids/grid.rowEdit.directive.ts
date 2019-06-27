import { Directive, ElementRef, forwardRef, HostListener, Inject, QueryList } from '@angular/core';
import { IgxGridBaseComponent } from './grid-base.component';

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
            const cell = this.grid.navigation.getCellElementByVisibleIndex(
                activeNode.row,
                activeNode.layout ? activeNode.layout.columnVisibleIndex : activeNode.column);
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
        this.currentCellIndex = event.shiftKey ? this.grid.lastEditableColumnIndex : this.grid.firstEditableColumnIndex;
        if (!this.grid.navigation.isColumnFullyVisible(this.currentCellIndex)) {
            this.grid.navigation.performHorizontalScrollToCell(
                this.grid.rowInEditMode.index, this.currentCellIndex, false, this.activateCell);
        } else {
            this.activateCell();
        }
    }

    /**
     * Sets the cell in edit mode and focus its native element
     * @param cellIndex index of the cell to activate
     */
    private activateCell = (): void => {
        const cell = this.grid.rowInEditMode.cells.find(e => e.visibleColumnIndex === this.currentCellIndex);
        cell.nativeElement.focus();
        cell.setEditMode(true);
        this.currentCellIndex = -1;
    }
}
