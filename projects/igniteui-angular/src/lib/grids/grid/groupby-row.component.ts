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
import { IgxSelectionAPIService } from '../../core/selection';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent } from '../grid-base.component';
import { first } from 'rxjs/operators';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-groupby-row',
    templateUrl: './groupby-row.component.html'
})
export class IgxGridGroupByRowComponent {

    constructor(public gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
        private selection: IgxSelectionAPIService,
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
    @ViewChild('groupContent')
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
            this.grid.verticalScrollContainer.onChunkLoad
            .pipe(first())
            .subscribe(() => {
                const groupRow = this.grid.nativeElement.querySelector(`[data-rowIndex="${groupRowIndex}"]`);
                if (groupRow) { groupRow.focus(); }
            });
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown', ['$event'])
    public onKeydown(event) {
        event.preventDefault();
        event.stopPropagation();
        const alt = event.altKey;
        const key = event.key.toLowerCase();

        if (!this.isKeySupportedInGroupRow(key) || event.ctrlKey) { return; }

        if (this.isToggleKey(key)) {
            if (!alt) { return; }
            if ((this.expanded && (key === 'left' || key === 'arrowleft')) ||
            (!this.expanded && (key === 'right' || key === 'arrowright'))) {
                this.toggle();
            }
            return;
        }
        const args = { cell: null, groupRow: this, event: event, cancel: false };
        this.grid.onFocusChange.emit(args);
        if (args.cancel) {
            return;
        }
        const colIndex = this._getSelectedColIndex() || 0;
        const visibleColumnIndex = this.grid.columnList.toArray()[colIndex].visibleIndex !== -1 ?
            this.grid.columnList.toArray()[colIndex].visibleIndex : 0;
        switch (key) {
            case 'arrowdown':
            case 'down':
                this.grid.navigation.navigateDown(this.nativeElement, this.index, visibleColumnIndex);
                break;
            case 'arrowup':
            case 'up':
                this.grid.navigation.navigateUp(this.nativeElement, this.index, visibleColumnIndex);
                break;
            case 'tab':
                if (event.shiftKey) {
                    if (this.index === 0) {
                        this.grid.navigation.moveFocusToFilterCell();
                    } else {
                        this.grid.navigation.navigateUp(this.nativeElement, this.index,
                            this.grid.unpinnedColumns[this.grid.unpinnedColumns.length - 1].visibleIndex);
                    }
                } else {
                    if (this.index === this.grid.verticalScrollContainer.igxForOf.length - 1 && this.grid.rootSummariesEnabled) {
                        this.grid.navigation.onKeydownHome(0, true);
                        return;
                    }
                    this.grid.navigation.navigateDown(this.nativeElement, this.index, 0);
                }
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
        return this.gridAPI.get(this.gridID);
    }

    /**
     * @hidden
     */
    get dataType(): any {
        return this.grid.getColumnByName(this.groupRow.expression.fieldName).dataType;
    }

    private _getSelectedColIndex() {
        const cell = this.selection.first_item(this.gridID + '-cell');
        if (cell) {
            return cell.columnID;
        }
    }

    private isKeySupportedInGroupRow(key) {
        return ['down', 'up', 'left', 'right', 'arrowdown', 'arrowup', 'arrowleft', 'arrowright',
            'tab'].indexOf(key) !== -1;
    }

    private isToggleKey(key) {
        return ['left', 'right', 'arrowleft', 'arrowright'].indexOf(key) !== -1;
    }

}
