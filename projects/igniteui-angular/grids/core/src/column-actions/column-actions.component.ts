import { Component, DoCheck, EventEmitter, HostBinding, Input, IterableDiffer, IterableDiffers, Output, Pipe, PipeTransform, QueryList, ViewChildren, booleanAttribute, forwardRef, inject } from '@angular/core';
import { ColumnDisplayOrder } from '../common/enums';
import { GridType } from '../common/grid.interface';
import { IColumnToggledEventArgs } from '../common/events';
import { IgxColumnActionsBaseDirective } from './column-actions-base.directive';
import { FormsModule } from '@angular/forms';
import { IgxInputDirective, IgxInputGroupComponent } from 'igniteui-angular/input-group';
import { IgxCheckboxComponent } from 'igniteui-angular/checkbox';
import { IgxButtonDirective, IgxRippleDirective } from 'igniteui-angular/directives';
import { ColumnType } from 'igniteui-angular/core';

let NEXT_ID = 0;
/**
 * Providing reference to `IgxColumnActionsComponent`:
 */
@Component({
    selector: 'igx-column-actions',
    templateUrl: './column-actions.component.html',
    imports: [IgxInputGroupComponent, FormsModule, IgxInputDirective, IgxCheckboxComponent, IgxButtonDirective, IgxRippleDirective, forwardRef(() => IgxColumnActionEnabledPipe), forwardRef(() => IgxFilterActionColumnsPipe), forwardRef(() => IgxSortActionColumnsPipe)]
})
export class IgxColumnActionsComponent implements DoCheck {
    private differs = inject(IterableDiffers);


    /**
     * Gets/Sets the grid to provide column actions for.
     */
    @Input()
    public grid: GridType;
    /**
     * Gets/sets the indentation of columns in the column list based on their hierarchy level.
     */
    @Input()
    public indentation = 30;
    /**
     * Sets/Gets the css class selector.
     * By default the value of the `class` attribute is `"igx-column-actions"`.
     */
    @HostBinding('class')
    public cssClass = 'igx-column-actions';
    /**
     * Gets/sets the max height of the columns area.
     *
     * @remarks
     * The default max height is 100%.
     */
    @Input()
    public columnsAreaMaxHeight = '100%';
    /**
     * Shows/hides the columns filtering input from the UI.
     */
    @Input({ transform: booleanAttribute })
    public hideFilter = false;
    /**
     * Gets the checkbox components representing column items currently present in the dropdown
     */
    @ViewChildren(IgxCheckboxComponent)
    public columnItems: QueryList<IgxCheckboxComponent>;
    /**
     * Gets/sets the title of the column actions component.
     */
    @Input()
    public title = '';

    /**
     * An event that is emitted after a column's checked state is changed.
     * Provides references to the `column` and the `checked` properties as event arguments.
     */
    @Output()
    public columnToggled = new EventEmitter<IColumnToggledEventArgs>();

    /**
     * @hidden @internal
     */
    public actionableColumns: ColumnType[] = [];

    /**
     * @hidden @internal
     */
    public filteredColumns: ColumnType[] = [];

    /**
     * @hidden @internal
     */
    public pipeTrigger = 0;

    /**
     * @hidden @internal
     */
    public actionsDirective: IgxColumnActionsBaseDirective;

    protected _differ: IterableDiffer<any> | null = null;

    /**
     * @hidden @internal
     */
    private _filterColumnsPrompt = '';

    /**
     * @hidden @internal
     */
    private _filterCriteria = '';

    /**
     * @hidden @internal
     */
    private _columnDisplayOrder: ColumnDisplayOrder = ColumnDisplayOrder.DisplayOrder;

    /**
     * @hidden @internal
     */
    private _uncheckAllText: string;

    /**
     * @hidden @internal
     */
    private _checkAllText: string;

    /**
     * @hidden @internal
     */
    private _id = `igx-column-actions-${NEXT_ID++}`;

    constructor() {
        this._differ = this.differs.find([]).create(this.trackChanges);
    }

    /**
     * Gets the prompt that is displayed in the filter input.
     */
    @Input()
    public get filterColumnsPrompt(): string {
        return this._filterColumnsPrompt;
    }
    /**
     * Sets the prompt that is displayed in the filter input.
     */
    public set filterColumnsPrompt(value: string) {
        this._filterColumnsPrompt = value || '';
    }
    /**
     * Gets the value which filters the columns list.
     */
    @Input()
    public get filterCriteria() {
        return this._filterCriteria;
    }
    /**
     * Sets the value which filters the columns list.
     */
    public set filterCriteria(value: string) {
        value = value || '';
        if (value !== this._filterCriteria) {
            this._filterCriteria = value;
            this.pipeTrigger++;
        }
    }
    /**
     * Gets the display order of the columns.
     */
    @Input()
    public get columnDisplayOrder() {
        return this._columnDisplayOrder;
    }
    /**
     * Sets the display order of the columns.
     */
    public set columnDisplayOrder(value: ColumnDisplayOrder) {
        if (value && value !== this._columnDisplayOrder) {
            this._columnDisplayOrder = value;
            this.pipeTrigger++;
        }
    }
    /**
     * Gets the text of the button that unchecks all columns.
     *
     * @remarks
     * If unset it is obtained from the IgxColumnActionsBased derived directive applied.
     */
    @Input()
    public get uncheckAllText() {
        return this._uncheckAllText || this.actionsDirective.uncheckAllLabel;
    }
    /**
     * Sets the text of the button that unchecks all columns.
     */
    public set uncheckAllText(value: string) {
        this._uncheckAllText = value;
    }
    /**
     * Gets the text of the button that checks all columns.
     *
     * @remarks
     * If unset it is obtained from the IgxColumnActionsBased derived directive applied.
     */
    @Input()
    public get checkAllText() {
        return this._checkAllText || this.actionsDirective.checkAllLabel;
    }
    /**
     * Sets the text of the button that checks all columns.
     *
     * @remarks
     * If unset it is obtained from the IgxColumnActionsBased derived directive applied.
     */
    public set checkAllText(value: string) {
        this._checkAllText = value;
    }

    /**
     * @hidden @internal
     */
    public get checkAllDisabled(): boolean {
        return this.actionsDirective.allUnchecked;

    }
    /**
     * @hidden @internal
     */
    public get uncheckAllDisabled(): boolean {
        return this.actionsDirective.allChecked;
    }

    /**
     * Gets/Sets the value of the `id` attribute.
     *
     * @remarks
     * If not provided it will be automatically generated.
     */
    @HostBinding('attr.id')
    @Input()
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }

    /**
     * @hidden @internal
     */
    public get titleID() {
        return this.id + '_title';
    }

    /**
     * @hidden @internal
     */
    public trackChanges = (index, col) => col.field + '_' + this.actionsDirective.actionEnabledColumnsFilter(col, index, []);

    /**
     * @hidden @internal
     */
    public ngDoCheck() {
        if (this._differ) {
            const changes = this._differ.diff(this.grid?.columnList);
            if (changes) {
                this.pipeTrigger++;
            }
        }
    }

    /**
     * Unchecks all columns and performs the appropriate action.
     */
    public uncheckAllColumns() {
        this.actionsDirective.uncheckAll();
    }

    /**
     * Checks all columns and performs the appropriate action.
     */
    public checkAllColumns() {
        this.actionsDirective.checkAll();
    }

    /**
     * @hidden @internal
     */
    public toggleColumn(column: ColumnType) {
        this.actionsDirective.toggleColumn(column);

        this.columnToggled.emit({ column: column as any, checked: this.actionsDirective.columnChecked(column) });
    }
}

@Pipe({
    name: 'columnActionEnabled',
    standalone: true
})
export class IgxColumnActionEnabledPipe implements PipeTransform {
    protected columnActions = inject<IgxColumnActionsComponent>(IgxColumnActionsComponent);


    public transform(
        collection: ColumnType[],
        actionFilter: (value: ColumnType, index: number, array: ColumnType[]) => boolean,
        _pipeTrigger: number
    ): ColumnType[] {
        if (!collection) {
            return collection;
        }
        let copy = collection.slice(0);
        if (copy.length && copy[0].grid.hasColumnLayouts) {
            copy = copy.filter(c => c.columnLayout);
        }
        if (actionFilter) {
            copy = copy.filter(actionFilter);
        }
        // Preserve the actionable collection for use in the component
        this.columnActions.actionableColumns = copy as any;
        return copy;
    }
}

@Pipe({
    name: 'filterActionColumns',
    standalone: true
})
export class IgxFilterActionColumnsPipe implements PipeTransform {
    protected columnActions = inject<IgxColumnActionsComponent>(IgxColumnActionsComponent);


    public transform(collection: ColumnType[], filterCriteria: string, _pipeTrigger: number): ColumnType[] {
        if (!collection) {
            return collection;
        }
        let copy = collection.slice(0);
        if (filterCriteria && filterCriteria.length > 0) {
            const filterFunc = (c) => {
                const filterText = c.header || c.field;
                if (!filterText) {
                    return false;
                }
                return filterText.toLocaleLowerCase().indexOf(filterCriteria.toLocaleLowerCase()) >= 0 ||
                    (c.children?.some(filterFunc) ?? false);
            };
            copy = collection.filter(filterFunc);
        }
        // Preserve the filtered collection for use in the component
        this.columnActions.filteredColumns = copy as any;
        return copy;
    }
}

@Pipe({
    name: 'sortActionColumns',
    standalone: true
})
export class IgxSortActionColumnsPipe implements PipeTransform {

    public transform(collection: ColumnType[], displayOrder: ColumnDisplayOrder, _pipeTrigger: number): ColumnType[] {
        if (displayOrder === ColumnDisplayOrder.Alphabetical) {
            return collection.sort((a, b) => (a.header || a.field).localeCompare(b.header || b.field));
        }
        return collection;
    }
}
