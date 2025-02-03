import { Subject } from 'rxjs';
import {
    AfterContentInit,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    Input,
    QueryList,
    TemplateRef,
    Output,
    EventEmitter,
    OnDestroy,
    Inject,
    Optional,
    Self,
    booleanAttribute,
} from '@angular/core';
import { notifyChanges } from '../watch-changes';
import { WatchColumnChanges } from '../watch-changes';
import { GridColumnDataType } from '../../data-operations/data-util';
import {
    IgxFilteringOperand,
    IgxBooleanFilteringOperand,
    IgxNumberFilteringOperand,
    IgxDateFilteringOperand,
    IgxStringFilteringOperand,
    IgxDateTimeFilteringOperand,
    IgxTimeFilteringOperand
} from '../../data-operations/filtering-condition';
import { ISortingStrategy, DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxRowDirective } from '../row.directive';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { CellType, ColumnType, GridType, IgxCellTemplateContext, IgxColumnTemplateContext, IgxSummaryTemplateContext, IGX_GRID_BASE } from '../common/grid.interface';
import { IgxGridHeaderComponent } from '../headers/grid-header.component';
import { IgxGridFilteringCellComponent } from '../filtering/base/grid-filtering-cell.component';
import { IgxGridHeaderGroupComponent } from '../headers/grid-header-group.component';
import {
    IgxSummaryOperand, IgxNumberSummaryOperand, IgxDateSummaryOperand,
    IgxSummaryResult, IgxTimeSummaryOperand
} from '../summaries/grid-summary';
import {
    IgxCellTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellEditorTemplateDirective,
    IgxCollapsibleIndicatorTemplateDirective,
    IgxFilterCellTemplateDirective,
    IgxSummaryTemplateDirective,
    IgxCellValidationErrorDirective
} from './templates.directive';
import { MRLResizeColumnInfo, MRLColumnSizeInfo, IColumnPipeArgs, IColumnEditorOptions } from './interfaces';
import { DropPosition } from '../moving/moving.service';
import { IColumnVisibilityChangingEventArgs, IPinColumnCancellableEventArgs, IPinColumnEventArgs } from '../common/events';
import { isConstructor, PlatformUtil } from '../../core/utils';
import { IgxGridCell } from '../grid-public-cell';
import { NG_VALIDATORS, Validator } from '@angular/forms';
import { Size } from '../common/enums';
import { ExpressionsTreeUtil } from '../../data-operations/expressions-tree-util';

const DEFAULT_DATE_FORMAT = 'mediumDate';
const DEFAULT_TIME_FORMAT = 'mediumTime';
const DEFAULT_DATE_TIME_FORMAT = 'medium';
const DEFAULT_DIGITS_INFO = '1.0-3';

/* blazorElement */
/* contentParent: ColumnGroup */
/* wcElementTag: igc-column */
/* additionalIdentifier: Field */
/* blazorIndirectRender */
/**
 * **Ignite UI for Angular Column** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid#columns-configuration)
 *
 * The Ignite UI Column is used within an `igx-grid` element to define what data the column will show. Features such as sorting,
 * filtering & editing are enabled at the column level.  You can also provide a template containing custom content inside
 * the column using `ng-template` which will be used for all cells within the column.
 *
 * @igxParent IgxGridComponent, IgxTreeGridComponent, IgxHierarchicalGridComponent, IgxPivotGridComponent, IgxRowIslandComponent, IgxColumnGroupComponent, IgxColumnLayoutComponent
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-column',
    template: ``,
    standalone: true
})
export class IgxColumnComponent implements AfterContentInit, OnDestroy, ColumnType {
    /**
     * Sets/gets the `field` value.
     * ```typescript
     * let columnField = this.column.field;
     * ```
     * ```html
     * <igx-column [field] = "'ID'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public set field(value: string) {
        this._field = value;
        this.hasNestedPath = value?.includes('.');
    }
    public get field(): string {
        return this._field;
    }


    /**
     * @hidden @internal
     */
    public validators: Validator[] = [];

    /**
     * Sets/gets the `header` value.
     * ```typescript
     * let columnHeader = this.column.header;
     * ```
     * ```html
     * <igx-column [header] = "'ID'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public header = '';
    /**
     * Sets/gets the `title` value.
     * ```typescript
     * let title = this.column.title;
     * ```
     * ```html
     * <igx-column [title] = "'Some column tooltip'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public title = '';
    /**
     * Sets/gets whether the column is sortable.
     * Default value is `false`.
     * ```typescript
     * let isSortable = this.column.sortable;
     * ```
     * ```html
     * <igx-column [sortable] = "true"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input({ transform: booleanAttribute })
    public sortable = false;
    /**
     * Returns if the column is selectable.
     * ```typescript
     * let columnSelectable = this.column.selectable;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input()
    public get selectable(): boolean {
        return this._selectable;
    }

    /**
     * Sets if the column is selectable.
     * Default value is `true`.
     * ```html
     * <igx-column [selectable] = "false"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set selectable(value: boolean) {
        this._selectable = value;
    }

    /**
     * Sets/gets whether the column is groupable.
     * Default value is `false`.
     * ```typescript
     * let isGroupable = this.column.groupable;
     * ```
     * ```html
     * <igx-column [groupable] = "true"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges(true)
    @WatchColumnChanges()
    @Input({ transform: booleanAttribute })
    public get groupable(): boolean {
        return this._groupable;
    }
    public set groupable(value: boolean) {
        this._groupable = value;
        this.grid.groupablePipeTrigger++;
    }
    /**
     * Gets whether the column is editable.
     * Default value is `false`.
     * ```typescript
     * let isEditable = this.column.editable;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input({ transform: booleanAttribute })
    public get editable(): boolean {
        // Updating the primary key when grid has transactions (incl. row edit)
        // should not be allowed, as that can corrupt transaction state.
        const rowEditable = this.grid && this.grid.rowEditable;
        const hasTransactions = this.grid && this.grid.transactions.enabled;

        if (this.isPrimaryColumn && (rowEditable || hasTransactions)) {
            return false;
        }

        if (this._editable !== undefined) {
            return this._editable;
        } else {
            return rowEditable;
        }
    }
    /**
     * Sets whether the column is editable.
     * ```typescript
     * this.column.editable = true;
     * ```
     * ```html
     * <igx-column [editable] = "true"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set editable(editable: boolean) {
        this._editable = editable;
    }
    /**
     * Sets/gets whether the column is filterable.
     * Default value is `true`.
     * ```typescript
     * let isFilterable = this.column.filterable;
     * ```
     * ```html
     * <igx-column [filterable] = "false"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input({ transform: booleanAttribute })
    public filterable = true;
    /**
     * Sets/gets whether the column is resizable.
     * Default value is `false`.
     * ```typescript
     * let isResizable = this.column.resizable;
     * ```
     * ```html
     * <igx-column [resizable] = "true"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input({ transform: booleanAttribute })
    public resizable = false;

    /**
     * Sets/gets whether the column header is included in autosize logic.
     * Useful when template for a column header is sized based on parent, for example a default `div`.
     * Default value is `false`.
     * ```typescript
     * let isResizable = this.column.resizable;
     * ```
     * ```html
     * <igx-column [resizable] = "true"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input({ transform: booleanAttribute })
    public autosizeHeader = true;

    /**
     * Gets a value indicating whether the summary for the column is enabled.
     * ```typescript
     * let hasSummary = this.column.hasSummary;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges(true)
    @WatchColumnChanges()
    @Input({ transform: booleanAttribute })
    public get hasSummary() {
        return this._hasSummary;
    }
    /**
     * Sets a value indicating whether the summary for the column is enabled.
     * Default value is `false`.
     * ```html
     * <igx-column [hasSummary] = "true"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set hasSummary(value) {
        this._hasSummary = value;

        if (this.grid) {
            this.grid.summaryService.resetSummaryHeight();
        }
    }
    /**
     * Gets whether the column is hidden.
     * ```typescript
     * let isHidden = this.column.hidden;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges(true)
    @WatchColumnChanges()
    @Input({ transform: booleanAttribute })
    public get hidden(): boolean {
        return this._hidden;
    }
    /**
     * Sets the column hidden property.
     * Default value is `false`.
     * ```html
     * <igx-column [hidden] = "true"></igx-column>
     * ```
     *
     * Two-way data binding.
     * ```html
     * <igx-column [(hidden)] = "model.isHidden"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set hidden(value: boolean) {
        if (this._hidden !== value) {
            this._hidden = value;
            this.hiddenChange.emit(this._hidden);
            if (this.columnLayoutChild && this.parent.hidden !== value) {
                this.parent.hidden = value;
                return;
            }
            if (this.grid) {
                this.grid.crudService.endEdit(false);
                this.grid.summaryService.resetSummaryHeight();
                this.grid.filteringService.refreshExpressions();
                this.grid.filteringService.hideFilteringRowOnColumnVisibilityChange(this);
                this.grid.notifyChanges();
            }
        }
    }

    /**
     * Returns if the column is selected.
     * ```typescript
     * let isSelected = this.column.selected;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public get selected(): boolean {
        return this.grid.selectionService.isColumnSelected(this.field);
    }

    /**
     * Select/deselect a column.
     * Default value is `false`.
     * ```typescript
     * this.column.selected = true;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set selected(value: boolean) {
        if (this.selectable && value !== this.selected) {
            if (value) {
                this.grid.selectionService.selectColumnsWithNoEvent([this.field]);
            } else {
                this.grid.selectionService.deselectColumnsWithNoEvent([this.field]);
            }
            this.grid.notifyChanges();
        }
    }

    /**
     * @hidden
     */
    @Output()
    public hiddenChange = new EventEmitter<boolean>();

    /** @hidden */
    @Output()
    public expandedChange = new EventEmitter<boolean>();

    /** @hidden */
    @Output()
    public collapsibleChange = new EventEmitter<boolean>();
    /** @hidden */
    @Output()
    public visibleWhenCollapsedChange = new EventEmitter<boolean>();

    /** @hidden */
    @Output()
    public columnChange = new EventEmitter<void>();

    /**
     * Gets whether the hiding is disabled.
     * ```typescript
     * let isHidingDisabled =  this.column.disableHiding;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input({ transform: booleanAttribute })
    public disableHiding = false;
    /**
     * Gets whether the pinning is disabled.
     * ```typescript
     * let isPinningDisabled =  this.column.disablePinning;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input({ transform: booleanAttribute })
    public disablePinning = false;

    /**
     * Gets the `width` of the column.
     * ```typescript
     * let columnWidth = this.column.width;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges(true)
    @WatchColumnChanges()
    @Input()
    public get width(): string {
        const isAutoWidth = this._width && typeof this._width === 'string' && this._width === 'auto';
        if (isAutoWidth) {
            if (!this.autoSize) {
                return 'fit-content';
            } else {
                return this.autoSize + 'px';
            }

        }
        return this.widthSetByUser ? this._width : this.defaultWidth;
    }

    /**
     * Sets the `width` of the column.
     * ```html
     * <igx-column [width] = "'25%'"></igx-column>
     * ```
     *
     * Two-way data binding.
     * ```html
     * <igx-column [(width)]="model.columns[0].width"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set width(value: string) {
        if (value) {
            this._calcWidth = null;
            this.calcPixelWidth = NaN;
            this.widthSetByUser = true;
            // width could be passed as number from the template
            // host bindings are not px affixed so we need to ensure we affix simple number strings
            if (typeof (value) === 'number' || value.match(/^[0-9]*$/)) {
                value = value + 'px';
            }
            if (value === 'fit-content') {
                value = 'auto';
            }
            this._width = value;
            if (this.grid) {
                this.cacheCalcWidth();
            }
            this.widthChange.emit(this._width);
        }
    }

    /** @hidden @internal **/
    public autoSize: number;

    /**
     * Sets/gets the maximum `width` of the column.
     * ```typescript
     * let columnMaxWidth = this.column.width;
     * ```
     * ```html
     * <igx-column [maxWidth] = "'150px'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input()
    public maxWidth: string;

    /**
     * Sets/gets the class selector of the column header.
     * ```typescript
     * let columnHeaderClass = this.column.headerClasses;
     * ```
     * ```html
     * <igx-column [headerClasses] = "'column-header'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public headerClasses = '';

    /**
     * Sets conditional style properties on the column header.
     * Similar to `ngStyle` it accepts an object literal where the keys are
     * the style properties and the value is the expression to be evaluated.
     * ```typescript
     * styles = {
     *  background: 'royalblue',
     *  color: (column) => column.pinned ? 'red': 'inherit'
     * }
     * ```
     * ```html
     * <igx-column [headerStyles]="styles"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public headerStyles = null;

    /**
     * Sets/gets the class selector of the column group header.
     * ```typescript
     * let columnHeaderClass = this.column.headerGroupClasses;
     * ```
     * ```html
     * <igx-column [headerGroupClasses] = "'column-group-header'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public headerGroupClasses = '';

    /**
     * Sets conditional style properties on the column header group wrapper.
     * Similar to `ngStyle` it accepts an object literal where the keys are
     * the style properties and the value is the expression to be evaluated.
     * ```typescript
     * styles = {
     *  background: 'royalblue',
     *  color: (column) => column.pinned ? 'red': 'inherit'
     * }
     * ```
     * ```html
     * <igx-column [headerGroupStyles]="styles"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public headerGroupStyles = null;

    /* treatAsRef */
    /**
     * Sets a conditional class selector of the column cells.
     * Accepts an object literal, containing key-value pairs,
     * where the key is the name of the CSS class, while the
     * value is either a callback function that returns a boolean,
     * or boolean, like so:
     * ```typescript
     * callback = (rowData, columnKey, cellValue, rowIndex) => { return rowData[columnKey] > 6; }
     * cellClasses = { 'className' : this.callback };
     * ```
     * ```html
     * <igx-column [cellClasses] = "cellClasses"></igx-column>
     * <igx-column [cellClasses] = "{'class1' : true }"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public cellClasses: any;

    /* treatAsRef */
    /**
     * Sets conditional style properties on the column cells.
     * Similar to `ngStyle` it accepts an object literal where the keys are
     * the style properties and the value is the expression to be evaluated.
     * As with `cellClasses` it accepts a callback function.
     * ```typescript
     * styles = {
     *  background: 'royalblue',
     *  color: (rowData, columnKey, cellValue, rowIndex) => value.startsWith('Important') ? 'red': 'inherit'
     * }
     * ```
     * ```html
     * <igx-column [cellStyles]="styles"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public cellStyles = null;

    /* blazorAlternateType: CellValueFormatterEventHandler */
    /* blazorOnlyScript */
    /**
     * Applies display format to cell values in the column. Does not modify the underlying data.
     *
     * @remarks
     * Note: As the formatter is used in places like the Excel style filtering dialog, in certain
     * scenarios (remote filtering for example), the row data argument can be `undefined`.
     *
     *
     * In this example, we check to see if the column name is Salary, and then provide a method as the column formatter
     * to format the value into a currency string.
     *
     * @example
     * ```typescript
     * columnInit(column: IgxColumnComponent) {
     *   if (column.field == "Salary") {
     *     column.formatter = (salary => this.format(salary));
     *   }
     * }
     *
     * format(value: number) : string {
     *   return formatCurrency(value, "en-us", "$");
     * }
     * ```
     *
     * @example
     * ```typescript
     * const column = this.grid.getColumnByName('Address');
     * const addressFormatter = (address: string, rowData: any) => data.privacyEnabled ? 'unknown' : address;
     * column.formatter = addressFormatter;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public formatter: (value: any, rowData?: any) => any;

    /* blazorAlternateType: SummaryValueFormatterEventHandler */
    /* blazorOnlyScript */
    /* forceCastDelegate */
    /**
     * The summaryFormatter is used to format the display of the column summaries.
     *
     * In this example, we check to see if the column name is OrderDate, and then provide a method as the summaryFormatter
     * to change the locale for the dates to 'fr-FR'. The summaries with the count key are skipped so they are displayed as numbers.
     *
     * ```typescript
     * columnInit(column: IgxColumnComponent) {
     *   if (column.field == "OrderDate") {
     *     column.summaryFormatter = this.summaryFormat;
     *   }
     * }
     *
     * summaryFormat(summary: IgxSummaryResult, summaryOperand: IgxSummaryOperand): string {
     *   const result = summary.summaryResult;
     *   if(summaryResult.key !== 'count' && result !== null && result !== undefined) {
     *      const pipe = new DatePipe('fr-FR');
     *      return pipe.transform(result,'mediumDate');
     *   }
     *   return result;
     * }
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public summaryFormatter: (summary: IgxSummaryResult, summaryOperand: IgxSummaryOperand) => any;

    /**
     * Sets/gets whether the column filtering should be case sensitive.
     * Default value is `true`.
     * ```typescript
     * let filteringIgnoreCase = this.column.filteringIgnoreCase;
     * ```
     * ```html
     * <igx-column [filteringIgnoreCase] = "false"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input({ transform: booleanAttribute })
    public filteringIgnoreCase = true;
    /**
     * Sets/gets whether the column sorting should be case sensitive.
     * Default value is `true`.
     * ```typescript
     * let sortingIgnoreCase = this.column.sortingIgnoreCase;
     * ```
     * ```html
     * <igx-column [sortingIgnoreCase] = "false"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input({ transform: booleanAttribute })
    public sortingIgnoreCase = true;
    /**
     * Sets/gets whether the column is `searchable`.
     * Default value is `true`.
     * ```typescript
     * let isSearchable =  this.column.searchable';
     * ```
     * ```html
     *  <igx-column [searchable] = "false"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input({ transform: booleanAttribute })
    public searchable = true;
    /**
     * Sets/gets the data type of the column values.
     * Default value is `string`.
     * ```typescript
     * let columnDataType = this.column.dataType;
     * ```
     * ```html
     * <igx-column [dataType] = "'number'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public dataType: GridColumnDataType = GridColumnDataType.String;

    /** @hidden */
    @Input()
    public collapsibleIndicatorTemplate: TemplateRef<IgxColumnTemplateContext>;

    /**
     * Row index where the current field should end.
     * The amount of rows between rowStart and rowEnd will determine the amount of spanning rows to that field
     * ```html
     * <igx-column-layout>
     *   <igx-column [rowEnd]="2" [rowStart]="1" [colStart]="1"></igx-column>
     * </igx-column-layout>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public rowEnd: number;

    /**
     * Column index where the current field should end.
     * The amount of columns between colStart and colEnd will determine the amount of spanning columns to that field
     * ```html
     * <igx-column-layout>
     *   <igx-column [colEnd]="3" [rowStart]="1" [colStart]="1"></igx-column>
     * </igx-column-layout>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public colEnd: number;

    /**
     * Row index from which the field is starting.
     * ```html
     * <igx-column-layout>
     *   <igx-column [rowStart]="1" [colStart]="1"></igx-column>
     * </igx-column-layout>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public rowStart: number;

    /**
     * Column index from which the field is starting.
     * ```html
     * <igx-column-layout>
     *   <igx-column [colStart]="1" [rowStart]="1"></igx-column>
     * </igx-column-layout>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public colStart: number;

    /**
     * Sets/gets custom properties provided in additional template context.
     *
     * ```html
     * <igx-column [additionalTemplateContext]="contextObject">
     *   <ng-template igxCell let-cell="cell" let-props="additionalTemplateContext">
     *      {{ props }}
     *   </ng-template>
     * </igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public additionalTemplateContext: any;

    /**
     * @hidden
     */
    @Output()
    public widthChange = new EventEmitter<string>();

    /**
     * @hidden
     */
    @Output()
    public pinnedChange = new EventEmitter<boolean>();
    /**
     * @hidden
     */
    @ContentChild(IgxFilterCellTemplateDirective, { read: IgxFilterCellTemplateDirective })
    public filterCellTemplateDirective: IgxFilterCellTemplateDirective;
    /**
     * @hidden
     */
    @ContentChild(IgxSummaryTemplateDirective, { read: IgxSummaryTemplateDirective })
    protected summaryTemplateDirective: IgxSummaryTemplateDirective;
    /**
     * @hidden
     * @see {@link bodyTemplate}
     */
    @ContentChild(IgxCellTemplateDirective, { read: IgxCellTemplateDirective })
    protected cellTemplate: IgxCellTemplateDirective;
    /**
     * @hidden
     */
    @ContentChild(IgxCellValidationErrorDirective, { read: IgxCellValidationErrorDirective })
    protected cellValidationErrorTemplate: IgxCellValidationErrorDirective;
    /**
     * @hidden
     */
    @ContentChildren(IgxCellHeaderTemplateDirective, { read: IgxCellHeaderTemplateDirective, descendants: false })
    protected headTemplate: QueryList<IgxCellHeaderTemplateDirective>;
    /**
     * @hidden
     */
    @ContentChild(IgxCellEditorTemplateDirective, { read: IgxCellEditorTemplateDirective })
    protected editorTemplate: IgxCellEditorTemplateDirective;
    /**
     * @hidden
     */
    @ContentChild(IgxCollapsibleIndicatorTemplateDirective, { read: IgxCollapsibleIndicatorTemplateDirective, static: false })
    protected collapseIndicatorTemplate: IgxCollapsibleIndicatorTemplateDirective;
    /**
     * @hidden
     */
    public get calcWidth(): any {
        return this.getCalcWidth();
    }

    /** @hidden @internal **/
    public calcPixelWidth: number;

    /**
     * @hidden
     */
    public get maxWidthPx() {
        const gridAvailableSize = this.grid.calcWidth;
        const isPercentageWidth = this.maxWidth && typeof this.maxWidth === 'string' && this.maxWidth.indexOf('%') !== -1;
        return isPercentageWidth ? parseFloat(this.maxWidth) / 100 * gridAvailableSize : parseFloat(this.maxWidth);
    }

    /**
     * @hidden
     */
    public get maxWidthPercent() {
        const gridAvailableSize = this.grid.calcWidth;
        const isPercentageWidth = this.maxWidth && typeof this.maxWidth === 'string' && this.maxWidth.indexOf('%') !== -1;
        return isPercentageWidth ? parseFloat(this.maxWidth) : parseFloat(this.maxWidth) / gridAvailableSize * 100;
    }

    /**
     * @hidden
     */
    public get minWidthPx() {
        const gridAvailableSize = this.grid.calcWidth;
        const isPercentageWidth = this.minWidth && typeof this.minWidth === 'string' && this.minWidth.indexOf('%') !== -1;
        return isPercentageWidth ? parseFloat(this.minWidth) / 100 * gridAvailableSize : parseFloat(this.minWidth);
    }

    /**
     * @hidden
     */
    public get minWidthPercent() {
        const gridAvailableSize = this.grid.calcWidth;
        const isPercentageWidth = this.minWidth && typeof this.minWidth === 'string' && this.minWidth.indexOf('%') !== -1;
        return isPercentageWidth ? parseFloat(this.minWidth) : parseFloat(this.minWidth) / gridAvailableSize * 100;
    }


    /**
     * Sets/gets the minimum `width` of the column.
     * Default value is `88`;
     * ```typescript
     * let columnMinWidth = this.column.minWidth;
     * ```
     * ```html
     * <igx-column [minWidth] = "'100px'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public set minWidth(value: string) {
        const minVal = parseFloat(value);
        if (Number.isNaN(minVal)) {
            return;
        }
        this._defaultMinWidth = value;

    }
    public get minWidth(): string {
        return !this._defaultMinWidth ? this.defaultMinWidth : this._defaultMinWidth;
    }

    /** @hidden @internal **/
    public get resolvedWidth(): string {
        if (this.columnLayoutChild) {
            return '';
        }
        const isAutoWidth = this._width && typeof this._width === 'string' && this._width === 'auto';
        return isAutoWidth ? this.width : this.calcPixelWidth + 'px';
    }

    /**
     * Gets the column index.
     * ```typescript
     * let columnIndex = this.column.index;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public get index(): number {
        return (this.grid as any)._columns.indexOf(this);
    }

    /**
     * Gets whether the column is `pinned`.
     * ```typescript
     * let isPinned = this.column.pinned;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @WatchColumnChanges()
    @Input({ transform: booleanAttribute })
    public get pinned(): boolean {
        return this._pinned;
    }
    /**
     * Sets whether the column is pinned.
     * Default value is `false`.
     * ```html
     * <igx-column [pinned] = "true"></igx-column>
     * ```
     *
     * Two-way data binding.
     * ```html
     * <igx-column [(pinned)] = "model.columns[0].isPinned"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set pinned(value: boolean) {
        if (this._pinned !== value) {
            const isAutoWidth = this.width && typeof this.width === 'string' && this.width === 'fit-content';
            if (this.grid && this.width && (isAutoWidth || !isNaN(parseInt(this.width, 10)))) {
                if (value) {
                    this.pin();
                } else {
                    this.unpin();
                }
                return;
            }
            /* No grid/width available at initialization. `initPinning` in the grid
               will re-init the group (if present)
            */
            this._pinned = value;
            this.pinnedChange.emit(this._pinned);
        }
    }

    /* treatAsRef */
    /**
     * Gets the column `summaries`.
     * ```typescript
     * let columnSummaries = this.column.summaries;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges(true)
    @WatchColumnChanges()
    @Input()
    public get summaries(): any {
        return this._summaries;
    }

    /* treatAsRef */
    /**
     * Sets the column `summaries`.
     * ```typescript
     * this.column.summaries = IgxNumberSummaryOperand;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set summaries(classRef: any) {
        if (isConstructor(classRef)) {
            this._summaries = new classRef();
        }

        if (this.grid) {
            this.grid.summaryService.removeSummariesCachePerColumn(this.field);
            this.grid.summaryPipeTrigger++;
            this.grid.summaryService.resetSummaryHeight();
        }
    }

    /**
     * Sets/gets the summary operands to exclude from display.
     * Accepts an array of string keys representing the summary types to disable, such as 'Min', 'Max', 'Count' etc.
     * ```typescript
     * let disabledSummaries = this.column.disabledSummaries;
     * ```
     * ```html
     * <igx-column [disabledSummaries]="['min', 'max', 'average']"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public get disabledSummaries(): string[] {
        return this._disabledSummaries;
    }

    public set disabledSummaries(value: string[]) {
        this._disabledSummaries = value;
        if (this.grid) {
            this.grid.summaryService.removeSummariesCachePerColumn(this.field);
            this.grid.summaryPipeTrigger++;
            this.grid.summaryService.resetSummaryHeight();
        }
    }

    /**
     * Gets the column `filters`.
     * ```typescript
     * let columnFilters = this.column.filters'
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public get filters(): IgxFilteringOperand {
        return this._filters;
    }
    /**
     * Sets the column `filters`.
     * ```typescript
     * this.column.filters = IgxBooleanFilteringOperand.instance().
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set filters(instance: IgxFilteringOperand) {
        this._filters = instance;
    }
    /**
     * Gets the column `sortStrategy`.
     * ```typescript
     * let sortStrategy = this.column.sortStrategy
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public get sortStrategy(): ISortingStrategy {
        return this._sortStrategy;
    }
    /**
     * Sets the column `sortStrategy`.
     * ```typescript
     * this.column.sortStrategy = new CustomSortingStrategy().
     * class CustomSortingStrategy extends SortingStrategy {...}
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set sortStrategy(classRef: ISortingStrategy) {
        this._sortStrategy = classRef;
    }

    /* blazorSuppress */
    /**
     * Gets the function that compares values for grouping.
     * ```typescript
     * let groupingComparer = this.column.groupingComparer'
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public get groupingComparer(): (a: any, b: any, currRec?: any, groupRec?: any) => number {
        return this._groupingComparer;
    }

    /* blazorSuppress */
    /**
     * Sets a custom function to compare values for grouping.
     * Subsequent values in the sorted data that the function returns 0 for are grouped.
     * ```typescript
     * this.column.groupingComparer = (a: any, b: any, currRec?: any, groupRec?: any) => { return a === b ? 0 : -1; }
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set groupingComparer(funcRef: (a: any, b: any, currRec?: any, groupRec?: any) => number) {
        this._groupingComparer = funcRef;
    }
    /**
     * @hidden @internal
     */
    public get defaultMinWidth(): string {
        if (!this.grid) {
            return '80';
        }
        switch (this.grid.gridSize) {
            case Size.Medium:
                return '64';
            case Size.Small:
                return '56';
            default:
                return '80';
        }
    }
    /**
     * Returns a reference to the `summaryTemplate`.
     * ```typescript
     * let summaryTemplate = this.column.summaryTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public get summaryTemplate(): TemplateRef<IgxSummaryTemplateContext> {
        return this._summaryTemplate;
    }
    /**
     * Sets the summary template.
     * ```html
     * <ng-template #summaryTemplate igxSummary let-summaryResults>
     *    <p>{{ summaryResults[0].label }}: {{ summaryResults[0].summaryResult }}</p>
     *    <p>{{ summaryResults[1].label }}: {{ summaryResults[1].summaryResult }}</p>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'summaryTemplate'", {read: TemplateRef })
     * public summaryTemplate: TemplateRef<any>;
     * this.column.summaryTemplate = this.summaryTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set summaryTemplate(template: TemplateRef<IgxSummaryTemplateContext>) {
        this._summaryTemplate = template;
    }

    /**
     * Returns a reference to the `bodyTemplate`.
     * ```typescript
     * let bodyTemplate = this.column.bodyTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input('cellTemplate')
    public get bodyTemplate(): TemplateRef<IgxCellTemplateContext> {
        return this._bodyTemplate;
    }
    /**
     * Sets the body template.
     * ```html
     * <ng-template #bodyTemplate igxCell let-val>
     *    <div style = "background-color: yellowgreen" (click) = "changeColor(val)">
     *       <span> {{val}} </span>
     *    </div>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'bodyTemplate'", {read: TemplateRef })
     * public bodyTemplate: TemplateRef<any>;
     * this.column.bodyTemplate = this.bodyTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set bodyTemplate(template: TemplateRef<IgxCellTemplateContext>) {
        this._bodyTemplate = template;
    }
    /**
     * Returns a reference to the header template.
     * ```typescript
     * let headerTemplate = this.column.headerTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public get headerTemplate(): TemplateRef<IgxColumnTemplateContext> {
        return this._headerTemplate;
    }
    /**
     * Sets the header template.
     * Note that the column header height is fixed and any content bigger than it will be cut off.
     * ```html
     * <ng-template #headerTemplate>
     *   <div style = "background-color:black" (click) = "changeColor(val)">
     *       <span style="color:red" >{{column.field}}</span>
     *   </div>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'headerTemplate'", {read: TemplateRef })
     * public headerTemplate: TemplateRef<any>;
     * this.column.headerTemplate = this.headerTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set headerTemplate(template: TemplateRef<IgxColumnTemplateContext>) {
        this._headerTemplate = template;
    }
    /**
     * Returns a reference to the inline editor template.
     * ```typescript
     * let inlineEditorTemplate = this.column.inlineEditorTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input('cellEditorTemplate')
    public get inlineEditorTemplate(): TemplateRef<IgxCellTemplateContext> {
        return this._inlineEditorTemplate;
    }
    /**
     * Sets the inline editor template.
     * ```html
     * <ng-template #inlineEditorTemplate igxCellEditor let-cell="cell">
     *     <input type="string" [(ngModel)]="cell.value"/>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'inlineEditorTemplate'", {read: TemplateRef })
     * public inlineEditorTemplate: TemplateRef<any>;
     * this.column.inlineEditorTemplate = this.inlineEditorTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set inlineEditorTemplate(template: TemplateRef<IgxCellTemplateContext>) {
        this._inlineEditorTemplate = template;
    }

    /**
     * Returns a reference to the validation error template.
     * ```typescript
     * let errorTemplate = this.column.errorTemplate;
     * ```
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input('errorTemplate')
    public get errorTemplate(): TemplateRef<IgxCellTemplateContext> {
        return this._errorTemplate;
    }
    /**
     * Sets the error template.
     * ```html
     * <ng-template igxCellValidationError let-cell="cell" #errorTemplate >
     *     <div *ngIf="cell.validation.errors?.['forbiddenName']">
     *      This name is forbidden.
     *     </div>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'errorTemplate'", {read: TemplateRef })
     * public errorTemplate: TemplateRef<any>;
     * this.column.errorTemplate = this.errorTemplate;
     * ```
     */
    public set errorTemplate(template: TemplateRef<IgxCellTemplateContext>) {
        this._errorTemplate = template;
    }

    /**
     * Returns a reference to the `filterCellTemplate`.
     * ```typescript
     * let filterCellTemplate = this.column.filterCellTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input('filterCellTemplate')
    public get filterCellTemplate(): TemplateRef<IgxColumnTemplateContext> {
        return this._filterCellTemplate;
    }
    /**
     * Sets the quick filter template.
     * ```html
     * <ng-template #filterCellTemplate IgxFilterCellTemplate let-column="column">
     *    <input (input)="onInput()">
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'filterCellTemplate'", {read: TemplateRef })
     * public filterCellTemplate: TemplateRef<any>;
     * this.column.filterCellTemplate = this.filterCellTemplate;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public set filterCellTemplate(template: TemplateRef<IgxColumnTemplateContext>) {
        this._filterCellTemplate = template;
    }

    /**
     * @hidden @internal
     */
    public get cells(): CellType[] {
        return this.grid.dataView
            .map((rec, index) => {
                if (!this.grid.isGroupByRecord(rec) && !this.grid.isSummaryRow(rec)) {
                    this.grid.pagingMode === 1 && this.grid.page !== 0 ? index = index + this.grid.perPage * this.grid.page : index = this.grid.dataRowList.first.index + index;
                    const cell = new IgxGridCell(this.grid as any, index, this);
                    return cell;
                }
            }).filter(cell => cell);
    }


    /**
     * @hidden @internal
     */
    public get _cells(): CellType[] {
        return this.grid.rowList.filter((row) => row instanceof IgxRowDirective)
            .map((row) => {
                if (row._cells) {
                    return row._cells.filter((cell) => cell.columnIndex === this.index);
                }
            }).reduce((a, b) => a.concat(b), []);
    }

    /**
     * Gets the column visible index.
     * If the column is not visible, returns `-1`.
     * ```typescript
     * let visibleColumnIndex =  this.column.visibleIndex;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public get visibleIndex(): number {
        if (!isNaN(this._vIndex)) {
            return this._vIndex;
        }
        const unpinnedColumns = this.grid.unpinnedColumns.filter(c => !c.columnGroup);
        const pinnedColumns = this.grid.pinnedColumns.filter(c => !c.columnGroup);

        let col = this;
        let vIndex = -1;

        if (this.columnGroup) {
            col = this.allChildren.filter(c => !c.columnGroup && !c.hidden)[0] as any;
        }
        if (this.columnLayoutChild) {
            return this.parent.childrenVisibleIndexes.find(x => x.column === this).index;
        }

        if (!this.pinned) {
            const indexInCollection = unpinnedColumns.indexOf(col);
            vIndex = indexInCollection === -1 ?
                -1 :
                (this.grid.isPinningToStart ?
                    pinnedColumns.length + indexInCollection :
                    indexInCollection);
        } else {
            const indexInCollection = pinnedColumns.indexOf(col);
            vIndex = this.grid.isPinningToStart ?
                indexInCollection :
                unpinnedColumns.length + indexInCollection;
        }
        this._vIndex = vIndex;
        return vIndex;
    }

    /* blazorCSSuppress - Blazor doesn't carry over the ColumnType interface + should translate as static bool value */
    /**
     * Returns a boolean indicating if the column is a `ColumnGroup`.
     * ```typescript
     * let columnGroup =  this.column.columnGroup;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public get columnGroup() {
        return false;
    }

    /* blazorCSSuppress - Blazor doesn't carry over the ColumnType interface + should translate as static bool value */
    /**
     * Returns a boolean indicating if the column is a `ColumnLayout` for multi-row layout.
     * ```typescript
     * let columnGroup =  this.column.columnGroup;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public get columnLayout() {
        return false;
    }

    /**
     * Returns a boolean indicating if the column is a child of a `ColumnLayout` for multi-row layout.
     * ```typescript
     * let columnLayoutChild =  this.column.columnLayoutChild;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public get columnLayoutChild(): boolean {
        return this.parent && this.parent.columnLayout;
    }

    /**
     * A list containing all the child columns under this column (if any).
     * Empty without children or if this column is not Group or Layout.
     */
    public get childColumns(): ColumnType[] {
        return [];
    }

    /** @hidden @internal **/
    public get allChildren(): IgxColumnComponent[] {
        return [];
    }
    /**
     * Returns the level of the column in a column group.
     * Returns `0` if the column doesn't have a `parent`.
     * ```typescript
     * let columnLevel =  this.column.level;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public get level() {
        let ptr = this.parent;
        let lvl = 0;

        while (ptr) {
            lvl++;
            ptr = ptr.parent;
        }
        return lvl;
    }

    /** @hidden @internal **/
    public get isLastPinned(): boolean {
        return this.grid.isPinningToStart &&
            this.grid.pinnedColumns[this.grid.pinnedColumns.length - 1] === this;
    }

    /** @hidden @internal **/
    public get isFirstPinned(): boolean {
        const pinnedCols = this.grid.pinnedColumns.filter(x => !x.columnGroup);
        return !this.grid.isPinningToStart && pinnedCols[0] === this;
    }

    /** @hidden @internal **/
    public get rightPinnedOffset(): string {
        return this.pinned && !this.grid.isPinningToStart ?
            - this.grid.pinnedWidth - this.grid.headerFeaturesWidth + 'px' :
            null;
    }

    /** @hidden @internal **/
    public get gridRowSpan(): number {
        return this.rowEnd && this.rowStart ? this.rowEnd - this.rowStart : 1;
    }
    /** @hidden @internal **/
    public get gridColumnSpan(): number {
        return this.colEnd && this.colStart ? this.colEnd - this.colStart : 1;
    }

    /**
     * Indicates whether the column will be visible when its parent is collapsed.
     * ```html
     * <igx-column-group>
     *   <igx-column [visibleWhenCollapsed]="true"></igx-column>
     * </igx-column-group>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @notifyChanges(true)
    @Input({ transform: booleanAttribute })
    public set visibleWhenCollapsed(value: boolean) {
        this._visibleWhenCollapsed = value;
        this.visibleWhenCollapsedChange.emit(this._visibleWhenCollapsed);
        if (this.parent) {
            this.parent?.setExpandCollapseState?.();
        }
    }

    public get visibleWhenCollapsed(): boolean {
        return this._visibleWhenCollapsed;
    }

    /* mustSetInCodePlatforms: WebComponents;Blazor;React */
    /**
     * @remarks
     * Pass optional parameters for DatePipe and/or DecimalPipe to format the display value for date and numeric columns.
     * Accepts an `IColumnPipeArgs` object with any of the `format`, `timezone` and `digitsInfo` properties.
     * For more details see https://angular.io/api/common/DatePipe and https://angular.io/api/common/DecimalPipe
     * @example
     * ```typescript
     * const pipeArgs: IColumnPipeArgs = {
     *      format: 'longDate',
     *      timezone: 'UTC',
     *      digitsInfo: '1.1-2'
     * }
     * ```
     * ```html
     * <igx-column dataType="date" [pipeArgs]="pipeArgs"></igx-column>
     * <igx-column dataType="number" [pipeArgs]="pipeArgs"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public set pipeArgs(value: IColumnPipeArgs) {
        this._columnPipeArgs = Object.assign(this._columnPipeArgs, value);
        this.grid.summaryService.clearSummaryCache();
        this.grid.pipeTrigger++;
    }
    /* mustSetInCodePlatforms: WebComponents;Blazor */
    public get pipeArgs(): IColumnPipeArgs {
        return this._columnPipeArgs;
    }

    /**
     * Pass optional properties for the default column editors.
     * @remarks
     * Options may be applicable only to specific column type editors.
     * @example
     * ```typescript
     * const editorOptions: IColumnEditorOptions = {
     *      dateTimeFormat: 'MM/dd/YYYY',
     * }
     * ```
     * ```html
     * <igx-column dataType="date" [editorOptions]="editorOptions"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @notifyChanges()
    @WatchColumnChanges()
    @Input()
    public set editorOptions(value: IColumnEditorOptions) {
        this._editorOptions = value;
    }
    public get editorOptions(): IColumnEditorOptions {
        return this._editorOptions;
    }

    /**
     * @hidden
     * @internal
     */
    public get collapsible() {
        return false;
    }
    public set collapsible(_value: boolean) { }

    /**
     * @hidden
     * @internal
     */
    public get expanded() {
        return true;
    }
    public set expanded(_value: boolean) { }

    /**
     * @hidden
     */
    public defaultWidth: string;

    /**
     * @hidden
     */
    public widthSetByUser: boolean;

    /**
     * @hidden
     */
    public hasNestedPath: boolean;

    /**
     * @hidden
     * @internal
     */
    public defaultTimeFormat = 'hh:mm:ss a';

    /**
     * @hidden
     * @internal
     */
    public defaultDateTimeFormat = 'dd/MM/yyyy HH:mm:ss a';


    /**
     * Returns the filteringExpressionsTree of the column.
     * ```typescript
     * let tree =  this.column.filteringExpressionsTree;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public get filteringExpressionsTree(): FilteringExpressionsTree {
        return ExpressionsTreeUtil.find(this.grid.filteringExpressionsTree, this.field) as FilteringExpressionsTree;
    }

    /* alternateName: parentColumn */
    /**
     * Sets/gets the parent column.
     * ```typescript
     * let parentColumn = this.column.parent;
     * ```
     * ```typescript
     * this.column.parent = higherLevelColumn;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public parent = null;

    /* blazorSuppress */
    /**
     * Sets/gets the children columns.
     * ```typescript
     * let columnChildren = this.column.children;
     * ```
     *
     * @deprecated in version 18.1.0. Use the `childColumns` property instead.
     */
    public children: QueryList<IgxColumnComponent>;
    /**
     * @hidden
     */
    public destroy$ = new Subject<any>();

    /**
     * @hidden
     */
    protected _applySelectableClass = false;

    protected _vIndex = NaN;
    /**
     * @hidden
     */
    protected _pinned = false;
    /**
     * @hidden
     */
    protected _bodyTemplate: TemplateRef<IgxCellTemplateContext>;
    /**
     * @hidden
     */
    protected _errorTemplate: TemplateRef<IgxCellTemplateContext>;
    /**
     * @hidden
     */
    protected _headerTemplate: TemplateRef<IgxColumnTemplateContext>;
    /**
     * @hidden
     */
    protected _summaryTemplate: TemplateRef<IgxSummaryTemplateContext>;
    /**
     * @hidden
     */
    protected _inlineEditorTemplate: TemplateRef<IgxCellTemplateContext>;
    /**
     * @hidden
     */
    protected _filterCellTemplate: TemplateRef<IgxColumnTemplateContext>;
    /**
     * @hidden
     */
    protected _summaries = null;
    /**
     * @hidden
     */
    private _disabledSummaries: string[] = [];
    /**
     * @hidden
     */
    protected _filters = null;
    /**
     * @hidden
     */
    protected _sortStrategy: ISortingStrategy = DefaultSortingStrategy.instance();
    /**
     * @hidden
     */
    protected _groupingComparer: (a: any, b: any, currRec?: any, groupRec?: any) => number;
    /**
     * @hidden
     */
    protected _hidden = false;
    /**
     * @hidden
     */
    protected _index: number;
    /**
     * @hidden
     */
    protected _disablePinning = false;
    /**
     * @hidden
     */
    protected _width: string;
    /**
     * @hidden
     */
    protected _defaultMinWidth = '';
    /**
     * @hidden
     */
    protected _hasSummary = false;
    /**
     * @hidden
     */
    protected _editable: boolean;
    /**
     * @hidden
     */
    protected _groupable = false;
    /**
     *  @hidden
     */
    protected _visibleWhenCollapsed;
    /**
     * @hidden
     */
    protected _collapsible = false;
    /**
     * @hidden
     */
    protected _expanded = true;
    /**
     * @hidden
     */
    protected _selectable = true;
    /**
     * @hidden
     */
    protected get isPrimaryColumn(): boolean {
        return this.field !== undefined && this.grid !== undefined && this.field === this.grid.primaryKey;
    }

    private _field: string;
    private _calcWidth = null;
    private _columnPipeArgs: IColumnPipeArgs = { digitsInfo: DEFAULT_DIGITS_INFO };
    private _editorOptions: IColumnEditorOptions = { };

    constructor(
        @Inject(IGX_GRID_BASE) public grid: GridType,
        @Optional() @Self() @Inject(NG_VALIDATORS) private _validators: Validator[],
        /** @hidden @internal **/
        public cdr: ChangeDetectorRef,
        protected platform: PlatformUtil,
    ) {
        this.validators = _validators;
    }

    /**
     * @hidden
     * @internal
     */
    public resetCaches() {
        this._vIndex = NaN;
        if (this.grid) {
            this.cacheCalcWidth();
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    /**
     * @hidden
     */
    public ngAfterContentInit(): void {
        if (this.summaryTemplateDirective) {
            this._summaryTemplate = this.summaryTemplateDirective.template;
        }
        if (this.cellTemplate) {
            this._bodyTemplate = this.cellTemplate.template;
        }
        if (this.cellValidationErrorTemplate) {
            this._errorTemplate = this.cellValidationErrorTemplate.template;
        }
        if (this.headTemplate && this.headTemplate.length) {
            this._headerTemplate = this.headTemplate.toArray()[0].template;
        }
        if (this.editorTemplate) {
            this._inlineEditorTemplate = this.editorTemplate.template;
        }
        if (this.filterCellTemplateDirective) {
            this._filterCellTemplate = this.filterCellTemplateDirective.template;
        }
        if (!this._columnPipeArgs.format) {
            this._columnPipeArgs.format = this.dataType === GridColumnDataType.Time ?
                DEFAULT_TIME_FORMAT : this.dataType === GridColumnDataType.DateTime ?
                    DEFAULT_DATE_TIME_FORMAT : DEFAULT_DATE_FORMAT;
        }
        if (!this.summaries) {
            switch (this.dataType) {
                case GridColumnDataType.Number:
                case GridColumnDataType.Currency:
                case GridColumnDataType.Percent:
                    this.summaries = IgxNumberSummaryOperand;
                    break;
                case GridColumnDataType.Date:
                case GridColumnDataType.DateTime:
                    this.summaries = IgxDateSummaryOperand;
                    break;
                case GridColumnDataType.Time:
                    this.summaries = IgxTimeSummaryOperand;
                    break;

                case GridColumnDataType.String:
                case GridColumnDataType.Boolean:
                default:
                    this.summaries = IgxSummaryOperand;
                    break;
            }
        }
        if (!this.filters) {
            switch (this.dataType) {
                case GridColumnDataType.Boolean:
                    this.filters = IgxBooleanFilteringOperand.instance();
                    break;
                case GridColumnDataType.Number:
                case GridColumnDataType.Currency:
                case GridColumnDataType.Percent:
                    this.filters = IgxNumberFilteringOperand.instance();
                    break;
                case GridColumnDataType.Date:
                    this.filters = IgxDateFilteringOperand.instance();
                    break;
                case GridColumnDataType.Time:
                    this.filters = IgxTimeFilteringOperand.instance();
                    break;
                case GridColumnDataType.DateTime:
                    this.filters = IgxDateTimeFilteringOperand.instance();
                    break;
                case GridColumnDataType.Image:
                    this.filterable = false;
                    break;
                case GridColumnDataType.String:
                default:
                    this.filters = IgxStringFilteringOperand.instance();
                    break;
            }
        }
    }

    /**
     * @hidden
     */
    public getGridTemplate(isRow: boolean): string {
        if (isRow) {
            const rowsCount = this.grid.type !== 'pivot' ? this.grid.multiRowLayoutRowSize : this.children.length - 1;
            return `repeat(${rowsCount},1fr)`;
        } else {
            return this.getColumnSizesString(this.children);
        }
    }

    /** @hidden @internal **/
    public getInitialChildColumnSizes(children: QueryList<IgxColumnComponent>): Array<MRLColumnSizeInfo> {
        const columnSizes: MRLColumnSizeInfo[] = [];
        // find the smallest col spans
        children.forEach(col => {
            if (!col.colStart) {
                return;
            }
            const newWidthSet = col.widthSetByUser && columnSizes[col.colStart - 1] && !columnSizes[col.colStart - 1].widthSetByUser;
            const newSpanSmaller = columnSizes[col.colStart - 1] && columnSizes[col.colStart - 1].colSpan > col.gridColumnSpan;
            const bothWidthsSet = col.widthSetByUser && columnSizes[col.colStart - 1] && columnSizes[col.colStart - 1].widthSetByUser;
            const bothWidthsNotSet = !col.widthSetByUser && columnSizes[col.colStart - 1] && !columnSizes[col.colStart - 1].widthSetByUser;

            if (columnSizes[col.colStart - 1] === undefined) {
                // If nothing is defined yet take any column at first
                // We use colEnd to know where the column actually ends, because not always it starts where we have it set in columnSizes.
                columnSizes[col.colStart - 1] = {
                    ref: col,
                    width: col.width === 'fit-content' ? col.autoSize :
                        col.widthSetByUser || this.grid.columnWidthSetByUser ? parseFloat(col.calcWidth) : null,
                    colSpan: col.gridColumnSpan,
                    colEnd: col.colStart + col.gridColumnSpan,
                    widthSetByUser: col.widthSetByUser
                };
            } else if (newWidthSet || (newSpanSmaller && ((bothWidthsSet) || (bothWidthsNotSet)))) {
                // If a column is set already it should either not have width defined or have width with bigger span than the new one.

                /**
                 *  If replaced column has bigger span, we want to fill the remaining columns
                 *  that the replacing column does not fill with the old one.
                 */
                if (bothWidthsSet && newSpanSmaller) {
                    // Start from where the new column set would end and apply the old column to the rest depending on how much it spans.
                    // We have not yet replaced it so we can use it directly from the columnSizes collection.
                    // This is where colEnd is used because the colStart of the old column is not actually i + 1.
                    for (let i = col.colStart - 1 + col.gridColumnSpan; i < columnSizes[col.colStart - 1].colEnd - 1; i++) {
                        if (!columnSizes[i] || !columnSizes[i].widthSetByUser) {
                            columnSizes[i] = columnSizes[col.colStart - 1];
                        } else {
                            break;
                        }
                    }
                }

                // Replace the old column with the new one.
                columnSizes[col.colStart - 1] = {
                    ref: col,
                    width: col.width === 'fit-content' ? col.autoSize :
                        col.widthSetByUser || this.grid.columnWidthSetByUser ? parseFloat(col.calcWidth) : null,
                    colSpan: col.gridColumnSpan,
                    colEnd: col.colStart + col.gridColumnSpan,
                    widthSetByUser: col.widthSetByUser
                };
            } else if (bothWidthsSet && columnSizes[col.colStart - 1].colSpan < col.gridColumnSpan) {
                // If the column already in the columnSizes has smaller span, we still need to fill any empty places with the current col.
                // Start from where the smaller column set would end and apply the bigger column to the rest depending on how much it spans.
                // Since here we do not have it in columnSizes we set it as a new column keeping the same colSpan.
                for (let i = col.colStart - 1 + columnSizes[col.colStart - 1].colSpan; i < col.colStart - 1 + col.gridColumnSpan; i++) {
                    if (!columnSizes[i] || !columnSizes[i].widthSetByUser) {
                        columnSizes[i] = {
                            ref: col,
                            width: col.width === 'fit-content' ? col.autoSize :
                                col.widthSetByUser || this.grid.columnWidthSetByUser ? parseFloat(col.calcWidth) : null,
                            colSpan: col.gridColumnSpan,
                            colEnd: col.colStart + col.gridColumnSpan,
                            widthSetByUser: col.widthSetByUser
                        };
                    } else {
                        break;
                    }
                }
            }
        });

        // Flatten columnSizes so there are not columns with colSpan > 1
        for (let i = 0; i < columnSizes.length; i++) {
            if (columnSizes[i] && columnSizes[i].colSpan > 1) {
                let j = 1;

                // Replace all empty places depending on how much the current column spans starting from next col.
                for (; j < columnSizes[i].colSpan && i + j + 1 < columnSizes[i].colEnd; j++) {
                    if (columnSizes[i + j] &&
                        ((!columnSizes[i].width && columnSizes[i + j].width) ||
                            (!columnSizes[i].width && !columnSizes[i + j].width && columnSizes[i + j].colSpan <= columnSizes[i].colSpan) ||
                            (!!columnSizes[i + j].width && columnSizes[i + j].colSpan <= columnSizes[i].colSpan))) {
                        // If we reach an already defined column that has width and the current doesn't have or
                        // if the reached column has bigger colSpan we stop.
                        break;
                    } else {
                        const width = columnSizes[i].widthSetByUser ?
                            columnSizes[i].width / columnSizes[i].colSpan :
                            columnSizes[i].width;
                        columnSizes[i + j] = {
                            ref: columnSizes[i].ref,
                            width,
                            colSpan: 1,
                            colEnd: columnSizes[i].colEnd,
                            widthSetByUser: columnSizes[i].widthSetByUser
                        };
                    }
                }

                // Update the current column width so it is divided between all columns it spans and set it to 1.
                columnSizes[i].width = columnSizes[i].widthSetByUser ?
                    columnSizes[i].width / columnSizes[i].colSpan :
                    columnSizes[i].width;
                columnSizes[i].colSpan = 1;

                // Update the index based on how much we have replaced. Subtract 1 because we started from 1.
                i += j - 1;
            }
        }

        return columnSizes;
    }

    /** @hidden @internal **/
    public getFilledChildColumnSizes(children: QueryList<IgxColumnComponent>): Array<string> {
        const columnSizes = this.getInitialChildColumnSizes(children);

        // fill the gaps if there are any
        const result: string[] = [];
        for (const size of columnSizes) {
            if (size && !!size.width) {
                result.push(size.width + 'px');
            } else {
                result.push(parseFloat(this.grid.getPossibleColumnWidth()) + 'px');
            }
        }
        return result;
    }

    /** @hidden @internal **/
    public getResizableColUnderEnd(): MRLResizeColumnInfo[] {
        if (this.columnLayout || !this.columnLayoutChild || this.columnGroup) {
            return [{ target: this, spanUsed: 1 }];
        }

        const columnSized = this.getInitialChildColumnSizes(this.parent.children);
        const targets: MRLResizeColumnInfo[] = [];
        const colEnd = this.colEnd ? this.colEnd : this.colStart + 1;

        for (let i = 0; i < columnSized.length; i++) {
            if (this.colStart <= i + 1 && i + 1 < colEnd) {
                targets.push({ target: columnSized[i].ref, spanUsed: 1 });
            }
        }

        const targetsSquashed: MRLResizeColumnInfo[] = [];
        for (const target of targets) {
            if (targetsSquashed.length && targetsSquashed[targetsSquashed.length - 1].target.field === target.target.field) {
                targetsSquashed[targetsSquashed.length - 1].spanUsed++;
            } else {
                targetsSquashed.push(target);
            }
        }

        return targetsSquashed;
    }

    /**
     * Pins the column at the provided index in the pinned area.
     * Defaults to index `0` if not provided, or to the initial index in the pinned area.
     * Returns `true` if the column is successfully pinned. Returns `false` if the column cannot be pinned.
     * Column cannot be pinned if:
     * - Is already pinned
     * - index argument is out of range
     * - The pinned area exceeds 80% of the grid width
     * ```typescript
     * let success = this.column.pin();
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public pin(index?: number): boolean {
        // TODO: Probably should the return type of the old functions
        // should be moved as a event parameter.
        const grid = (this.grid as any);
        if (this._pinned) {
            return false;
        }

        if (this.parent && !this.parent.pinned) {
            return this.topLevelParent.pin(index);
        }

        const hasIndex = index !== undefined;
        if (hasIndex && (index < 0 || index > grid.pinnedColumns.length)) {
            return false;
        }

        if (!this.parent && !this.pinnable) {
            return false;
        }

        const rootPinnedCols = grid._pinnedColumns.filter((c) => c.level === 0);
        index = hasIndex ? index : rootPinnedCols.length;
        const args: IPinColumnCancellableEventArgs = { column: this, insertAtIndex: index, isPinned: false, cancel: false };
        this.grid.columnPin.emit(args);

        if (args.cancel) {
            return;
        }

        this.grid.crudService.endEdit(false);

        this._pinned = true;
        this.pinnedChange.emit(this._pinned);
        // it is possible that index is the last position, so will need to find target column by [index-1]
        const targetColumn = args.insertAtIndex === grid._pinnedColumns.length ?
            grid._pinnedColumns[args.insertAtIndex - 1] : grid._pinnedColumns[args.insertAtIndex];

        if (grid._pinnedColumns.indexOf(this) === -1) {
            if (!grid.hasColumnGroups) {
                grid._pinnedColumns.splice(args.insertAtIndex, 0, this);
            } else {
                // insert based only on root collection
                rootPinnedCols.splice(args.insertAtIndex, 0, this);
                let allPinned = [];
                // re-create hierarchy
                rootPinnedCols.forEach(group => {
                    allPinned.push(group);
                    allPinned = allPinned.concat(group.allChildren);
                });
                grid._pinnedColumns = allPinned;
            }

            if (grid._unpinnedColumns.indexOf(this) !== -1) {
                const childrenCount = this.allChildren.length;
                grid._unpinnedColumns.splice(grid._unpinnedColumns.indexOf(this), 1 + childrenCount);
            }
        }

        if (hasIndex) {
            index === grid._pinnedColumns.length - 1 ?
                grid._moveColumns(this, targetColumn, DropPosition.AfterDropTarget) : grid._moveColumns(this, targetColumn, DropPosition.BeforeDropTarget);
        }

        if (this.columnGroup) {
            this.allChildren.forEach(child => child.pin());
            grid.reinitPinStates();
        }

        grid.resetCaches();
        grid.notifyChanges();
        if (this.columnLayoutChild) {
            this.grid.columns.filter(x => x.columnLayout).forEach(x => x.populateVisibleIndexes());
        }
        this.grid.filteringService.refreshExpressions();
        const eventArgs: IPinColumnEventArgs = { column: this, insertAtIndex: index, isPinned: true };
        this.grid.columnPinned.emit(eventArgs);
        return true;
    }
    /**
     * Unpins the column and place it at the provided index in the unpinned area.
     * Defaults to index `0` if not provided, or to the initial index in the unpinned area.
     * Returns `true` if the column is successfully unpinned. Returns `false` if the column cannot be unpinned.
     * Column cannot be unpinned if:
     * - Is already unpinned
     * - index argument is out of range
     * ```typescript
     * let success = this.column.unpin();
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public unpin(index?: number): boolean {
        const grid = (this.grid as any);
        if (!this._pinned) {
            return false;
        }

        if (this.parent && this.parent.pinned) {
            return this.topLevelParent.unpin(index);
        }
        const hasIndex = index !== undefined;
        if (hasIndex && (index < 0 || index > grid._unpinnedColumns.length)) {
            return false;
        }

        // estimate the exact index at which column will be inserted
        // takes into account initial unpinned index of the column
        if (!hasIndex) {
            const indices = grid.unpinnedColumns.map(col => col.index);
            indices.push(this.index);
            indices.sort((a, b) => a - b);
            index = indices.indexOf(this.index);
        }

        const args: IPinColumnCancellableEventArgs = { column: this, insertAtIndex: index, isPinned: true, cancel: false };
        this.grid.columnPin.emit(args);

        if (args.cancel) {
            return;
        }

        this.grid.crudService.endEdit(false);

        this._pinned = false;
        this.pinnedChange.emit(this._pinned);

        // it is possible that index is the last position, so will need to find target column by [index-1]
        const targetColumn = args.insertAtIndex === grid._unpinnedColumns.length ?
            grid._unpinnedColumns[args.insertAtIndex - 1] : grid._unpinnedColumns[args.insertAtIndex];

        if (!hasIndex) {
            grid._unpinnedColumns.splice(index, 0, this);
            if (grid._pinnedColumns.indexOf(this) !== -1) {
                grid._pinnedColumns.splice(grid._pinnedColumns.indexOf(this), 1);
            }
        }

        if (hasIndex) {
            grid.moveColumn(this, targetColumn);
        }

        if (this.columnGroup) {
            this.allChildren.forEach(child => child.unpin());
        }

        grid.reinitPinStates();
        grid.resetCaches();

        grid.notifyChanges();
        if (this.columnLayoutChild) {
            this.grid.columns.filter(x => x.columnLayout).forEach(x => x.populateVisibleIndexes());
        }
        this.grid.filteringService.refreshExpressions();

        this.grid.columnPinned.emit({ column: this, insertAtIndex: index, isPinned: false });

        return true;
    }

    /**
     * Moves a column to the specified visible index.
     * If passed index is invalid, or if column would receive a different visible index after moving, moving is not performed.
     * If passed index would move the column to a different column group. moving is not performed.
     *
     * @example
     * ```typescript
     * column.move(index);
     * ```
     * @memberof IgxColumnComponent
     */
    public move(index: number) {
        let target;
        let columns = this.grid.columns.filter(c => c.visibleIndex > -1);
        // grid last visible index
        const li = columns.map(c => c.visibleIndex).reduce((a, b) => Math.max(a, b));
        const parent = this.parent;
        const isPreceding = this.visibleIndex < index;

        if (index === this.visibleIndex || index < 0 || index > li) {
            return;
        }

        if (parent) {
            columns = columns.filter(c => c.level >= this.level && c !== this && c.parent !== this &&
                c.topLevelParent === this.topLevelParent);
        }

        // If isPreceding, find a target such that when the current column is placed after it, current colummn will receive a visibleIndex === index. This takes into account visible children of the columns.
        // If !isPreceding, finds a column of the same level and visible index that equals the passed index agument (c.visibleIndex === index). No need to consider the children here.

        if (isPreceding) {
            columns = columns.filter(c => c.visibleIndex > this.visibleIndex);
            target = columns.find(c => c.level === this.level && c.visibleIndex + (c as any).calcChildren() - this.calcChildren() === index);
        } else {
            columns = columns.filter(c => c.visibleIndex < this.visibleIndex);
            target = columns.find(c => c.level === this.level && c.visibleIndex === index);
        }

        if (!target || (target.pinned && this.disablePinning)) {
            return;
        }

        const pos = isPreceding ? DropPosition.AfterDropTarget : DropPosition.BeforeDropTarget;
        this.grid.moveColumn(this, target as IgxColumnComponent, pos);
    }

    /**
     * No children for the column, so will returns 1 or 0, if the column is hidden.
     *
     * @hidden
     */
    public calcChildren(): number {
        const children = this.hidden ? 0 : 1;
        return children;
    }

    /**
     * Toggles column vibisility and emits the respective event.
     *
     * @hidden
     */
    public toggleVisibility(value?: boolean) {
        const newValue = value ?? !this.hidden;
        const eventArgs: IColumnVisibilityChangingEventArgs = { column: this, newValue, cancel: false };
        this.grid.columnVisibilityChanging.emit(eventArgs);

        if (eventArgs.cancel) {
            return;
        }
        this.hidden = newValue;
        this.grid.columnVisibilityChanged.emit({ column: this, newValue });
    }

    /**
     * Returns a reference to the top level parent column.
     * ```typescript
     * let topLevelParent =  this.column.topLevelParent;
     * ```
     */
    public get topLevelParent(): ColumnType | undefined {
        let parent = this.parent;
        while (parent && parent.parent) {
            parent = parent.parent;
        }
        return parent ?? undefined;
    }

    /**
     * @hidden @internal
     */
    public get headerCell(): IgxGridHeaderComponent {
        return this.grid.headerCellList.find((header) => header.column === this);
    }

    /**
     * @hidden @internal
     */
    public get filterCell(): IgxGridFilteringCellComponent {
        return this.grid.filterCellList.find((filterCell) => filterCell.column === this);
    }

    /**
     * @hidden @internal
     */
    public get headerGroup(): IgxGridHeaderGroupComponent {
        return this.grid.headerGroupsList.find(group => group.column === this);
    }

    /**
     * Autosize the column to the longest currently visible cell value, including the header cell.
     * ```typescript
     * @ViewChild('grid') grid: IgxGridComponent;
     * let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
     * column.autosize();
     * ```
     *
     * @memberof IgxColumnComponent
     * @param byHeaderOnly Set if column should be autosized based only on the header content.
     */
    public autosize(byHeaderOnly = false) {
        if (!this.columnGroup) {
            this.width = this.getAutoSize(byHeaderOnly);
            this.grid.reflow();
        }
    }

    /**
     * @hidden
     */
    public getAutoSize(byHeader = false): string {
        const size = !byHeader ? this.getLargestCellWidth() :
            (Object.values(this.getHeaderCellWidths()).reduce((a, b) => a + b) + 'px');
        const isPercentageWidth = this.width && typeof this.width === 'string' && this.width.indexOf('%') !== -1;

        let newWidth;
        if (isPercentageWidth) {
            const gridAvailableSize = this.grid.calcWidth;
            const percentageSize = parseFloat(size) / gridAvailableSize * 100;
            newWidth = percentageSize + '%';
        } else {
            newWidth = size;
        }

        const maxWidth = isPercentageWidth ? this.maxWidthPercent : this.maxWidthPx;
        const minWidth = isPercentageWidth ? this.minWidthPercent : this.minWidthPx;
        if (this.maxWidth && (parseFloat(newWidth) > maxWidth)) {
            newWidth = isPercentageWidth ? maxWidth + '%' : maxWidth + 'px';
        } else if (parseFloat(newWidth) < minWidth) {
            newWidth = isPercentageWidth ? minWidth + '%' : minWidth + 'px';
        }

        return newWidth;
    }

    /**
     * @hidden
     */
    public getCalcWidth(): any {
        if (this._calcWidth && !isNaN(this.calcPixelWidth)) {
            return this._calcWidth;
        }
        this.cacheCalcWidth();
        return this._calcWidth;
    }


    /**
     * @hidden
     * Returns the width and padding of a header cell.
     */
    public getHeaderCellWidths() {
        return this.grid.getHeaderCellWidth(this.headerCell.nativeElement);
    }

    /**
     * @hidden
     * Returns the size (in pixels) of the longest currently visible cell, including the header cell.
     * ```typescript
     * @ViewChild('grid') grid: IgxGridComponent;
     *
     * let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
     * let size = column.getLargestCellWidth();
     * ```
     * @memberof IgxColumnComponent
     */
    public getLargestCellWidth(): string {
        const range = this.grid.document.createRange();
        const largest = new Map<number, number>();

        if (this._cells.length > 0) {
            const cellsContentWidths = [];
            this._cells.forEach((cell) => cellsContentWidths.push(cell.calculateSizeToFit(range)));

            const index = cellsContentWidths.indexOf(Math.max(...cellsContentWidths));
            const cellStyle = this.grid.document.defaultView.getComputedStyle(this._cells[index].nativeElement);
            const cellPadding = parseFloat(cellStyle.paddingLeft) + parseFloat(cellStyle.paddingRight) +
                parseFloat(cellStyle.borderLeftWidth) + parseFloat(cellStyle.borderRightWidth);

            largest.set(Math.max(...cellsContentWidths), cellPadding);
        }

        if (this.headerCell && this.autosizeHeader) {
            const headerCellWidths = this.getHeaderCellWidths();
            largest.set(headerCellWidths.width, headerCellWidths.padding);
        }

        const largestCell = Math.max(...Array.from(largest.keys()));
        const width = Math.ceil(largestCell + largest.get(largestCell));

        if (Number.isNaN(width)) {
            return this.width;
        } else {
            return width + 'px';
        }
    }

    /**
     * @hidden
     */
    public getCellWidth() {
        const colWidth = this.width;
        const isPercentageWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1;

        if (this.columnLayoutChild) {
            return '';
        }

        if (colWidth && !isPercentageWidth) {

            let cellWidth = colWidth;
            if (typeof cellWidth !== 'string' || cellWidth.endsWith('px') === false) {
                cellWidth += 'px';
            }

            return cellWidth;
        } else {
            return colWidth;
        }
    }

    /**
     * @hidden
     */
    public populateVisibleIndexes() { }

    protected getColumnSizesString(children: QueryList<IgxColumnComponent>): string {
        const res = this.getFilledChildColumnSizes(children);
        return res.join(' ');
    }

    /**
     * @hidden
     * @internal
     */
    protected cacheCalcWidth(): any {
        const colWidth = this.width;
        const isPercentageWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1;
        const isAutoWidth = colWidth && typeof colWidth === 'string' && colWidth === 'fit-content';
        if (isPercentageWidth && this.grid.isColumnWidthSum) {
            this._calcWidth = this.grid.minColumnWidth;
        } else if (isPercentageWidth) {
            this._calcWidth = parseFloat(colWidth) / 100 * this.grid.calcWidth;
        } else if (!colWidth || isAutoWidth && !this.autoSize) {
            // no width
            this._calcWidth = this.defaultWidth || this.grid.getPossibleColumnWidth();
        } else {
            this._calcWidth = this.width;
        }
        this.calcPixelWidth = parseFloat(this._calcWidth);
    }

    /**
     * @hidden
     * @internal
     */
    protected setExpandCollapseState() {
        this.children.filter(col => (col.visibleWhenCollapsed !== undefined)).forEach(c => {
            if (!this.collapsible) {
                c.hidden = this.hidden; return;
            }
            c.hidden = this._expanded ? c.visibleWhenCollapsed : !c.visibleWhenCollapsed;
        });
    }
    /**
     * @hidden
     * @internal
     */
    protected checkCollapsibleState() {
        if (!this.children) {
            return false;
        }
        const cols = this.children.map(child => child.visibleWhenCollapsed);
        return (cols.some(c => c === true) && cols.some(c => c === false));
    }

    /**
     * @hidden
     */
    public get pinnable() {
        return (this.grid as any)._init || !this.pinned;
    }

    /**
     * @hidden
     */
    public get applySelectableClass(): boolean {
        return this._applySelectableClass;
    }

    /**
     * @hidden
     */
    public set applySelectableClass(value: boolean) {
        if (this.selectable) {
            this._applySelectableClass = value;
        }
    }
}
