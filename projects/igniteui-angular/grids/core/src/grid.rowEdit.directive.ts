import { Directive, ElementRef, HostListener, Inject } from '@angular/core';
import { GridType, IgxGridEmptyTemplateContext, IgxGridRowEditActionsTemplateContext, IgxGridRowEditTemplateContext, IgxGridRowEditTextTemplateContext, IGX_GRID_BASE } from './common/grid.interface';

/** @hidden @internal */
@Directive({
    selector: '[igxRowEdit]',
    standalone: true
})
export class IgxRowEditTemplateDirective {
    public static ngTemplateContextGuard(_directive: IgxRowEditTemplateDirective,
        context: unknown): context is IgxGridRowEditTemplateContext { 
        return true;
    }
 }

/** @hidden @internal */
@Directive({
    selector: '[igxRowEditText]',
    standalone: true
})
export class IgxRowEditTextDirective {
    public static ngTemplateContextGuard(_directive: IgxRowEditTextDirective,
        context: unknown): context is IgxGridRowEditTextTemplateContext { 
        return true;
    }
 }

/** @hidden @internal */
@Directive({
    selector: '[igxRowAddText]',
    standalone: true
})
export class IgxRowAddTextDirective {
    public static ngTemplateContextGuard(_directive: IgxRowAddTextDirective,
        context: unknown): context is IgxGridEmptyTemplateContext { 
        return true;
    }
 }

/** @hidden @internal */
@Directive({
    selector: '[igxRowEditActions]',
    standalone: true
})
export class IgxRowEditActionsDirective {
    public static ngTemplateContextGuard(_directive: IgxRowEditActionsDirective,
        context: unknown): context is IgxGridRowEditActionsTemplateContext { 
        return true;
    }
 }


// TODO: Refactor circular ref, deps and logic
/** @hidden @internal */
@Directive({
    selector: `[igxRowEditTabStop]`,
    standalone: true
})
export class IgxRowEditTabStopDirective {
    private currentCellIndex: number;

    constructor(@Inject(IGX_GRID_BASE) public grid: GridType, public element: ElementRef<HTMLElement>) {}

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
