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
import { IgxSelectionAPIService } from '../core/selection';
import { IGroupByRecord } from '../data-operations/groupby-record.interface';
import { IgxGridAPIService } from './api.service';
import { IgxGridComponent } from './grid.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-groupby-row',
    templateUrl: './groupby-row.component.html'
})
export class IgxGridGroupByRowComponent {

    constructor(public gridAPI: IgxGridAPIService,
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
    public tabindex = 0;

    /**
     * @hidden
     */
    @HostBinding('attr.aria-describedby')
    get describedBy(): string {
        return this.gridID + '_' + this.groupRow.expression.fieldName;
    }

    /**
     * Returns a reference to the underlying HTML element.
     * ```typescript
     * const groupRowElement = this.nativeElement;
     * ```
     */
    get nativeElement(): HTMLElement {
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
        return `${this.defaultCssClass} ` + `${this.paddingIndentationCssClass}-` + this.groupRow.level;
    }

    /**
     * Toggles the group row.
     * ```typescript
     * this.grid1.rowList.first.toggle()
     * ```
     */
    public toggle() {
        this.grid.toggleGroup(this.groupRow);
    }

    /**
     * @hidden
     */
    @HostListener('keydown', ['$event'])
    public onKeydown(event) {
        if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Space' || event.key === 'Enter') {
            event.preventDefault();
            this.grid.toggleGroup(this.groupRow);
        }
    }

    /**
     * Returns a reference to the `IgxGridComponent` the `IgxGridGroupByRowComponent` belongs to.
     * ```typescript
     * this.grid1.rowList.first.grid;
     * ```
     */
    get grid(): IgxGridComponent {
        return this.gridAPI.get(this.gridID);
    }

    /**
     * @hidden
     */
    get dataType(): any {
        return this.grid.getColumnByName(this.groupRow.expression.fieldName).dataType;
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowdown', ['$event'])
    public onKeydownArrowDown(event) {
        const colIndex = this._getSelectedColIndex() || this._getPrevSelectedColIndex();
        const visibleColumnIndex = colIndex ? this.grid.columnList.toArray()[colIndex].visibleIndex : 0;
        event.preventDefault();
        event.stopPropagation();
        const rowIndex = this.index + 1;
        this.grid.navigateDown(rowIndex, visibleColumnIndex);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowup', ['$event'])
    public onKeydownArrowUp(event) {
        const colIndex = this._getSelectedColIndex() || this._getPrevSelectedColIndex();
        const visibleColumnIndex = colIndex ? this.grid.columnList.toArray()[colIndex].visibleIndex : 0;
        event.preventDefault();
        event.stopPropagation();
        if (this.index === 0) {
            return;
        }
        const rowIndex = this.index - 1;
        this.grid.navigateUp(rowIndex, visibleColumnIndex);
    }

    /**
     * @hidden
     */
    public onFocus() {
        this.isFocused = true;
    }

    /**
     * @hidden
     */
    public onBlur() {
        this.isFocused = false;
    }

    private _getSelectedColIndex() {
        const cell = this.selection.first_item(this.gridID + '-cell');
        if (cell) {
            return cell.columnID;
        }
    }

    private _getPrevSelectedColIndex() {
        const prevCell = this.selection.first_item(this.gridID + '-prev-cell');
        if (prevCell) {
            return prevCell.columnID;
        }
    }
}
