import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    Output,
    ViewChild
} from '@angular/core';
import { IgxColumnComponent } from '../columns/column.component';
import { ColumnDisplayOrder } from '../common/enums';
import { IgxColumnActionsBaseDirective } from './column-actions-base.directive';

/**
 * Providing reference to `IgxColumnActionsComponent`:
 * ```typescript
 *  @ViewChild('columnActions', { read: IgxColumnActionsComponent })
 *  public columnActions: IgxColumnActionsComponent;
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-column-actions',
    templateUrl: './column-actions.component.html',
    providers: []
})
export class IgxColumnActionsComponent implements OnDestroy {

    /**
     * @hidden @internal
     */
    private _columns: IgxColumnComponent[] = [];
    /**
     * Gets the grid columns to provide an action for.
     * @example
     * ```typescript
     * let gridColumns = this.columnActions.columns;
     * ```
     */
    @Input()
    public get columns() {
        return this._columns;
    }
    /**
     * Sets the grid columns to provide an action for.
     * @example
     * ```html
     * <igx-column-actions [columns]="grid.columns"></igx-column-actions>
     * ```
     */
    public set columns(value: IgxColumnComponent[]) {
        if (value) {
            this.columns = value;
            this._pipeTrigger++;
            this.cdr.detectChanges();
        }
    }

    /**
     * Gets/sets the title of the column actions component.
     * @example
     * ```html
     * <igx-column-actions [title]="'Pin Columns'"></igx-column-actions>
     * ```
     */
    @Input()
    public title = '';

    /**
     * Gets/sets the prompt that is displayed in the filter input.
     * @example
     * ```html
     * <igx-column-actions [filterColumnsPrompt]="'Type here to search'"></igx-column-actions>
     * ```
     */
    @Input()
    public filterColumnsPrompt = '';

    /**
     * Shows/hides the columns filtering input from the UI.
     * @example
     * ```html
     *  <igx-column-actions [hideFilter]="true"></igx-column-actions>
     * ```
     */
    @Input()
    public hideFilter = false;

    /**
     * @hidden @internal
     */
    // private _currentColumns = [];
    /**
     * Gets the items of the selected columns.
     * ```typescript
     * let columnItems =  this.columnHidingUI.columnItems;
     * ```
     */
    // @Input()
    // get columnItems() {
    //   return this._currentColumns;
    // }

    /**
     * @hidden @internal
     */
    private _filterCriteria = '';
    /**
     * Gets the value which filters the columns list.
     * @example
     * ```typescript
     * let filterCriteria =  this.columnActions.filterCriteria;
     * ```
     */
    @Input()
    public get filterCriteria() {
        return this._filterCriteria;
    }
    /**
     * Sets the value which filters the columns list.
     * @example
     * ```html
     *  <igx-column-actions [filterCriteria]="'ID'"></igx-column-actions>
     * ```
     */
    public set filterCriteria(value: string) {
        value = value || '';
        if (value !== this._filterCriteria) {
            this._filterCriteria = value;
            this._pipeTrigger++;
            this.cdr.detectChanges();
        }
    }

    /**
     * @hidden @internal
     */
    private _columnDisplayOrder = ColumnDisplayOrder.DisplayOrder;
    /**
     * Gets the display order of the columns.
     * @example
     * ```typescript
     * let columnDisplayOrder  =  this.columnActions.columnDisplayOrder;
     * ```
     */
    @Input()
    public get columnDisplayOrder() {
        return this._columnDisplayOrder;
    }
    /**
     * Sets the display order of the columns.
     * @example
     * ```typescript
     * this.columnActions.columnDisplayOrder = ColumnDisplayOrder.Alphabetical;
     * ```
     */
    public set columnDisplayOrder(value: ColumnDisplayOrder) {
        if (value && value !== this._columnDisplayOrder) {
            this._columnDisplayOrder = value;
            this._pipeTrigger++;
            this.cdr.detectChanges();
        }
    }

    /**
     * Gets/sets the max height of the columns area.
     * @remarks
     * The default max height is 100%.
     * @example
     * ```html
     * <igx-column-actions [columnsAreaMaxHeight]="200px"></igx-column-actions>
     * ```
     */
    @Input()
    public columnsAreaMaxHeight = '100%';

    /**
     * Gets/sets the text of the button that unchecks all columns.
     * @example
     * ```html
     * <igx-column-actions [uncheckAllText] = "'Show Columns'"></igx-column-actions>
     * ```
     */
    @Input()
    public uncheckAllText = 'Uncheck All';

    /**
     * Gets/sets the text of the button that checks all columns.
     * @example
     * ```html
     * <igx-column-actions [checkAllText] = "'Hide Columns'"></igx-column-actions>
     * ```
     */
    @Input()
    public checkAllText = 'Check All';

    /**
     * An event that is emitted after the columns visibility is changed.
     * Provides references to the `column` and the `newValue` properties as event arguments.
     * ```html
     *  <igx-column-hiding (onColumnVisibilityChanged) = "onColumnVisibilityChanged($event)"></igx-column-hiding>
     * ```
     */
    // @Output()
    // public onColumnVisibilityChanged = new EventEmitter<IColumnVisibilityChangedEventArgs>();

    /**
     * Gets the count of the hidden columns.
     * ```typescript
     * let hiddenColumnsCount =  this.columnHiding.hiddenColumnsCount;
     * ```
     */
    // public get hiddenColumnsCount() {
    //    return (this.columns) ? this.columns.filter((col) => col.hidden).length : 0;
    // }

    /**
     * @hidden @internal
     */
    private _pipeTrigger = 0;
    /**
     * @hidden @internal
     */
    public get pipeTrigger(): number {
        return this._pipeTrigger;
    }

    /**
     * Sets/Gets the css class selector.
     * By default the value of the `class` attribute is `"igx-column-hiding"`.
     * ```typescript
     * let cssCLass =  this.columnHidingUI.cssClass;
     * ```
     * ```typescript
     * this.columnHidingUI.cssClass = 'column-chooser';
     * ```
     */
    @HostBinding('attr.class')
    public cssClass = 'igx-column-hiding';

    /**
     * @hidden @internal
     */
    @ViewChild(IgxColumnActionsBaseDirective)
    public actionsDirective: IgxColumnActionsBaseDirective;

    /**
     * @hidden @internal
     */
    private get checkAllDisabled(): boolean {
        return false;
    /*    if (!this.columnItems || this.columnItems.length < 1 ||
            this.hiddenColumnsCount === this.columns.length) {
            return true;
        } else if (this.hidableColumns.length < 1 ||
            this.hidableColumns.length === this.hidableColumns.filter((col) => col.value).length) {
            return true;
        } else {
            return false;
        }*/
    }
    /**
     * @hidden @internal
     */
    private get uncheckAllDisabled(): boolean {
        return false;
      /*  if (!this.columnItems || this.columnItems.length < 1 ||
            this.hiddenColumnsCount < 1 || this.hidableColumns.length < 1) {
            return true;
        } else if (this.hidableColumns.length === this.hidableColumns.filter((col) => !col.value).length) {
            return true;
        } else {
            return false;
        }*/
    }

    constructor(public cdr: ChangeDetectorRef) {
    }

    /**
    * @hidden
    */
    ngOnDestroy() {
       // for (const item of this._currentColumns) {
       //     item.valueChanged.unsubscribe();
       // }
    }

    /**
     * Unchecks all columns and performs the appropriate action.
     * @example
     * ```typescript
     * this.columnActions.uncheckAllColumns();
     * ```
     */
    public uncheckAllColumns() {
        this.actionsDirective.uncheckAll();
       // const collection = this.hidableColumns;
      //  for (const col of collection) {
     //       col.value = false;
      //  }
    }

    /**
     * Checks all columns and performs the appropriate action.
     * @example
     * ```typescript
     * this.columnActions.checkAllColumns();
     * ```
     */
    public checkAllColumns() {
        this.actionsDirective.checkAll();
     //   const collection = this.hidableColumns;
     //   for (const col of collection) {
     //       col.value = true;
      //  }
    }

    /*get name() {
        return (this.column) ? ((this.column.header) ? this.column.header : this.column.field) : '';
    }

    get level() {
        return this.column.level;
    }

    get calcIndent() {
        return this.indentation * this.level;
    }*/
}