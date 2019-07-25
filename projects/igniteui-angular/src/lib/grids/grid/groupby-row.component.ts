import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    ViewChild,
} from '@angular/core';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent, IGridDataBindable } from '../grid-base.component';
import { IgxGridSelectionService, ISelectionNode } from '../../core/grid-selection';
import { ROW_COLLAPSE_KEYS, ROW_EXPAND_KEYS, SUPPORTED_KEYS } from '../../core/utils';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-groupby-row',
    templateUrl: './groupby-row.component.html'
})
export class IgxGridGroupByRowComponent {

    constructor(public gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>,
        private gridSelection: IgxGridSelectionService,
        public element: ElementRef,
        public cdr: ChangeDetectorRef) { }

    /**
     * @hidden
     */
    protected defaultCssClass = 'igx-grid__group-row';

    /**
     * @hidden
     */
    protected paddingIndentationCssClass = 'igx-grid__group-row--padding-level';

    /**
     * @hidden
     */
    @Input()
    protected isFocused = false;

    /**
     * Returns whether the row is focused.
     * ```
     * let gridRowFocused = this.grid1.rowList.first.focused;
     * ```
     */
    get focused(): boolean {
        return this.isFocused;
    }

    /**
     * An @Input property that sets the index of the row.
     * ```html
     * <igx-grid-groupby-row [gridID]="id" [index]="rowIndex" [groupRow]="rowData" #row></igx-grid-groupby-row>
     * ```
     */
    @Input()
    public index: number;

    /**
     * An @Input property that sets the id of the grid the row belongs to.
     * ```html
     * <igx-grid-groupby-row [gridID]="id" [index]="rowIndex" [groupRow]="rowData" #row></igx-grid-groupby-row>
     * ```
     */
    @Input()
    public gridID: string;

    /**
     * An @Input property that specifies the group record the component renders for.
     * ```typescript
     * <igx-grid-groupby-row [gridID]="id" [index]="rowIndex" [groupRow]="rowData" #row></igx-grid-groupby-row>
     * ```
     */
    @Input()
    public groupRow: IGroupByRecord;

    /**
     * Returns a reference of the content of the group.
     * ```typescript
     * const groupRowContent = this.grid1.rowList.first.groupContent;
     * ```
     */
    @ViewChild('groupContent', { static: true })
    public groupContent: ElementRef;

    /**
     * Returns whether the group row is expanded.
     * ```typescript
     * const groupRowExpanded = this.grid1.rowList.first.expanded;
     * ```
     */
    @HostBinding('attr.aria-expanded')
    get expanded(): boolean {
        return this.grid.isExpandedGroup(this.groupRow);
    }

    /**
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    /**
     * @hidden
     */
    @HostBinding('attr.aria-describedby')
    get describedBy(): string {
        const grRowExpr = this.groupRow.expression !== undefined ? this.groupRow.expression.fieldName : '';
        return this.gridID + '_' + grRowExpr;
    }

    @HostBinding('attr.data-rowIndex')
    get dataRowIndex() {
        return this.index;
    }

    /**
     * Returns a reference to the underlying HTML element.
     * ```typescript
     * const groupRowElement = this.nativeElement;
     * ```
     */
    get nativeElement(): any {
        return this.element.nativeElement;
    }

    /**
     * Returns the style classes applied to the group rows.
     * ```typescript
     * const groupCssStyles = this.grid1.rowList.first.styleClasses;
     * ```
     */
    @HostBinding('class')
    get styleClasses(): string {
        return `${this.defaultCssClass} ` + `${this.paddingIndentationCssClass}-` + this.groupRow.level +
            (this.focused ? ` ${this.defaultCssClass}--active` : '');
    }

    /**
     *@hidden
     */
    @HostListener('focus')
    public onFocus() {
        this.isFocused = true;
    }

    /**
     *@hidden
     */
    @HostListener('blur')
    public onBlur() {
        this.isFocused = false;
    }

    /**
     * Toggles the group row.
     * ```typescript
     * this.grid1.rowList.first.toggle()
     * ```
     */
    public toggle() {
        const isVirtualized = !this.grid.verticalScrollContainer.dc.instance.notVirtual;
        const groupRowIndex = this.index;
        this.grid.toggleGroup(this.groupRow);
        if (isVirtualized) {
            const groupRow = this.grid.nativeElement.querySelector(`[data-rowIndex="${groupRowIndex}"]`);
            if (groupRow) {
                groupRow.focus();
            }
        }
    }

    protected get selectionNode(): ISelectionNode {
        return {
            row: this.index,
            column: this.gridSelection.activeElement ? this.gridSelection.activeElement.column : 0
        };
    }

    /**
     * @hidden
     */
    @HostListener('keydown', ['$event'])
    public onKeydown(event) {
        // TODO: Refactor
        const key = event.key.toLowerCase();
        if (!SUPPORTED_KEYS.has(key)) {
            return;
        }
        event.stopPropagation();
        const keydownArgs = { targetType: 'groupRow', target: this, event: event, cancel: false };
        this.grid.onGridKeydown.emit(keydownArgs);
        if (keydownArgs.cancel) {
            return;
        }
        event.preventDefault();

        if (!this.isKeySupportedInGroupRow(key, event.shiftKey, event.altKey) || event.ctrlKey) { return; }

        if (this.isToggleKey(key, event.altKey)) {
            if ((this.expanded && ROW_COLLAPSE_KEYS.has(key)) || (!this.expanded && ROW_EXPAND_KEYS.has(key))) {
                this.toggle();
            }
            return;
        }
        // TODO: to be deleted when onFocusChange event is removed #4054
        const args = { cell: this, groupRow: null, event: event, cancel: false };
        this.grid._onFocusChange.emit(args);
        if (args.cancel) { return; }

        const selection = this.gridSelection;
        selection.keyboardState.shift = event.shiftKey && !(key === 'tab');

        const activeNode = selection.activeElement ? Object.assign({}, selection.activeElement) : this.selectionNode;
        activeNode.row = this.index;
        switch (key) {
            case 'arrowdown':
            case 'down':
                this.grid.navigation.navigateDown(this.nativeElement, activeNode);
                break;
            case 'arrowup':
            case 'up':
                this.grid.navigation.navigateUp(this.nativeElement, activeNode);
                break;
            case 'tab':
                this.handleTabKey(event.shiftKey, activeNode);
                break;
        }
    }

    /**
     * Returns a reference to the `IgxGridComponent` the `IgxGridGroupByRowComponent` belongs to.
     * ```typescript
     * this.grid1.rowList.first.grid;
     * ```
     */
    get grid(): any {
        return this.gridAPI.grid;
    }

    /**
     * @hidden
     */
    get dataType(): any {
        return this.grid.getColumnByName(this.groupRow.expression.fieldName).dataType;
    }

    private handleTabKey(shift: boolean, activeNode: ISelectionNode) {
        if (shift) {
            this.grid.navigation.performShiftTabKey(this.nativeElement, activeNode);
        } else {
            if (this.index === this.grid.verticalScrollContainer.igxForOf.length - 1 && this.grid.rootSummariesEnabled) {
                this.grid.navigation.onKeydownHome(0, true);
            } else {
                const orderedColumns = this.grid.navigation.gridOrderedColumns;
                const lastCol = orderedColumns[orderedColumns.length - 1];
                activeNode.column = lastCol.columnLayoutChild ? lastCol.parent.visibleIndex : lastCol.visibleIndex;
                this.grid.navigation.performTab(this.nativeElement, activeNode);
            }
        }
    }

    private isKeySupportedInGroupRow(key, shift = false, alt = false) {
        if (shift) {
            return ['down', 'up', 'arrowdown', 'arrowup', 'tab'].indexOf(key) !== -1;
        }
        return this.isToggleKey(key, alt) ? true : ['down', 'up', 'arrowdown', 'arrowup', 'tab'].indexOf(key) !== -1;
    }

    private isToggleKey(key, altKey) {
        return altKey && ['left', 'right', 'up', 'down', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown'].indexOf(key) !== -1;
    }

}
