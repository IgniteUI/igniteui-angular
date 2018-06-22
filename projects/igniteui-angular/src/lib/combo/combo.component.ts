import { ConnectedPositioningStrategy } from './../services/overlay/position/connected-positioning-strategy';
import { CommonModule } from '@angular/common';
import {
    AfterViewInit, ChangeDetectorRef, Component, ContentChild,
    ElementRef, EventEmitter,
    HostBinding, HostListener, Input, NgModule, OnInit, Output, QueryList, TemplateRef, ViewChild, ViewChildren
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { IgxCheckboxComponent, IgxCheckboxModule } from '../checkbox/checkbox.component';
import { IgxSelectionAPIService } from '../core/selection';
import { cloneArray } from '../core/utils';
import { IgxStringFilteringOperand, IgxBooleanFilteringOperand } from '../data-operations/filtering-condition';
import { FilteringLogic } from '../data-operations/filtering-expression.interface';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxForOfModule, IForOfState } from '../directives/for-of/for_of.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxDropDownItemBase } from '../drop-down/drop-down-item.component';
import { IgxDropDownModule } from '../drop-down/drop-down.component';
import { IgxIconModule } from '../icon/index';
import { IgxInputGroupModule } from '../input-group/input-group.component';
import { IgxComboItemComponent } from './combo-item.component';
import { IgxComboDropDownComponent } from './combo-dropdown.component';
import { IgxComboFilterConditionPipe, IgxComboFilteringPipe, IgxComboGroupingPipe, IgxComboSortingPipe } from './combo.pipes';
import { OverlaySettings, NoOpScrollStrategy } from '../services';

export enum DataTypes {
    EMPTY = 'empty',
    PRIMITIVE = 'primitive',
    COMPLEX = 'complex',
    PRIMARYKEY = 'valueKey'
}

export interface IComboSelectionChangeEventArgs {
    oldSelection: any[];
    newSelection: any[];
    event?: Event;
}

export interface IComboItemAdditionEvent {
    oldCollection: any[];
    addedItem: any;
    newCollection: any[];
}

let currentItem = 0;
const noop = () => { };

@Component({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxComboComponent, multi: true }],
    selector: 'igx-combo',
    templateUrl: 'combo.component.html'
})
export class IgxComboComponent implements AfterViewInit, ControlValueAccessor, OnInit {
    public id = '';
    /**
     * @hidden
     */
    public customValueFlag = true;
    /**
     * @hidden
     */
    public defaultFallbackGroup = 'Other';
    /**
     * @hidden
     */
    protected stringFilters = IgxStringFilteringOperand;
    /**
     * @hidden
     */
    protected boolenFilters = IgxBooleanFilteringOperand;
    /**
     * @hidden
     */
    protected _filteringLogic = FilteringLogic.Or;
    /**
     * @hidden
     */
    protected _filteringExpressions = [];
    /**
     * @hidden
     */
    protected _sortingExpressions = [];
    /**
     * @hidden
     */
    protected _groupKey: string | number = '';
    /**
     * @hidden
     */
    protected _displayKey: string | number = '';
    private _dataType = '';
    private _filteredData = [];
    private _children: QueryList<IgxDropDownItemBase>;
    private _dropdownContainer: ElementRef = null;
    private _searchInput: ElementRef<HTMLInputElement> = null;
    private _comboInput: ElementRef<HTMLInputElement> = null;
    private _width = '250px';
    private _onChangeCallback: (_: any) => void = noop;
    private overlaySettings: OverlaySettings = {
        positionStrategy: new ConnectedPositioningStrategy(),
        scrollStrategy: new NoOpScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };

    private _value = '';
    private _searchValue = '';

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selectionAPI: IgxSelectionAPIService) {
    }
    /**
     * @hidden
     */
    @ViewChild(IgxComboDropDownComponent, { read: IgxComboDropDownComponent })
    public dropdown: IgxComboDropDownComponent;

    /**
     * @hidden
     */
    @ViewChild('selectAllCheckbox', { read: IgxCheckboxComponent })
    public selectAllCheckbox: IgxCheckboxComponent;

    /**
     * @hidden
     */
    get searchInput() {
        return this._searchInput;
    }

    /**
     * @hidden
     */
    @ViewChild('searchInput')
    set searchInput(content: ElementRef<HTMLInputElement>) {
        this._searchInput = content;
    }

    /**
     * @hidden
     */
    get comboInput() {
        return this._comboInput;
    }

    /**
     * @hidden
     */
    @ViewChild('comboInput')
    set comboInput(content: ElementRef<HTMLInputElement>) {
        this._comboInput = content;
    }

    /**
     * @hidden
     */
    @ViewChild('primitive', { read: TemplateRef })
    protected primitiveTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ViewChild('complex', { read: TemplateRef })
    protected complexTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild('emptyTemplate', { read: TemplateRef })
    public emptyTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild('headerTemplate', { read: TemplateRef })
    public headerTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild('footerTemplate', { read: TemplateRef })
    public footerTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild('itemTemplate', { read: TemplateRef })
    public itemTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild('addItemTemplate', { read: TemplateRef })
    public addItemTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild('headerItemTemplate', { read: TemplateRef })
    public headerItemTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ViewChild('dropdownItemContainer')
    protected set dropdownContainer(val: ElementRef) {
        this._dropdownContainer = val;
    }

    /**
     * @hidden
     */
    protected get dropdownContainer(): ElementRef {
        return this._dropdownContainer;
    }

    /**
     * @hidden
     */
    @ViewChildren(IgxComboItemComponent, { read: IgxComboItemComponent })
    public set children(list: QueryList<IgxDropDownItemBase>) {
        this._children = list;
    }

    /**
     * @hidden
     */
    public get children(): QueryList<IgxDropDownItemBase> {
        return this._children;
    }

    /**
     * Emitted when item selection is changing, before the selection completes
     *
     * ```html
     * <igx-combo (onSelectionChange)='handleSelection()'></igx-combo>
     * ```
     */
    @Output()
    public onSelectionChange = new EventEmitter<IComboSelectionChangeEventArgs>();

    /**
     * Emitted before the dropdown is opened
     *
     * ```html
     * <igx-combo onOpening='handleOpening()'></igx-combo>
     * ```
     */
    @Output()
    public onOpening = new EventEmitter();

    /**
     * Emitted after the dropdown is opened
     *
     * ```html
     * <igx-combo (onOpened)='handleOpened()'></igx-combo>
     * ```
     */
    @Output()
    public onOpened = new EventEmitter();

    /**
     * Emitted before the dropdown is closed
     *
     * ```html
     * <igx-combo (onClosing)='handleClosing()'></igx-combo>
     * ```
     */
    @Output()
    public onClosing = new EventEmitter();

    /**
     * Emitted after the dropdown is closed
     *
     * ```html
     * <igx-combo (onClosed)='handleClosed()'></igx-combo>
     * ```
     */
    @Output()
    public onClosed = new EventEmitter();

    /**
     * Emitted when an item is being added to the data collection
     *
     * ```html
     * <igx-combo (onAddition)='handleAdditionEvent()'></igx-combo>
     * ```
     */
    @Output()
    public onAddition = new EventEmitter<IComboItemAdditionEvent>();

    /**
     * Emitted when an the search input's input event is triggered
     *
     * ```html
     * <igx-combo (onSearchInput)='handleSearchInputEvent()'></igx-combo>
     * ```
     */
    @Output()
    public onSearchInput = new EventEmitter();

    /**
     * Emitted when new chunk of data is loaded from the virtualization
     *
     * ```html
     * <igx-combo (onDataPreLoad)='handleDataPreloadEvent()'></igx-combo>
     * ```
     */
    @Output()
    public onDataPreLoad = new EventEmitter<any>();

    /**
     * Sets the style width of the element
     *
     * ```typescript
     * // get
     * let myComboWidth = this.combo.width;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [width]='250px'></igx-combo>
     * ```
     */
    @HostBinding('style.width')
    @Input()
    public get width() {
        return this._width;
    }

    public set width(val) {
        this._width = val;
    }


    /**
     * Sets the style height of the element
     *
     * ```typescript
     * // get
     * let myComboHeight = this.combo.height;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [height]='400px'></igx-combo>
     * ```
     */
    @Input()
    public height = '400px';

    /**
     * Controls whether custom values can be added to the collection
     *
     * ```typescript
     * // get
     * let comboAllowsCustomValues = this.combo.allowCustomValues;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [allowCustomValues]='true'></igx-combo>
     * ```
     */
    @Input()
    public allowCustomValues = false;

    /**
     * Configures the drop down list height
     *
     * ```typescript
     * // get
     * let myComboItemsMaxHeight = this.combo.itemsMaxHeight;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [itemsMaxHeight]='320'></igx-combo>
     * ```
    */
    @Input()
    public itemsMaxHeight = 320;

    /**
     * Configures the drop down list width
     *
     * ```typescript
     * // get
     * let myComboItemsMaxWidth = this.combo.itemsMaxWidth;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [itemsMaxWidth] = '80'></igx-combo>
     * ```
     */
    @Input()
    public itemsMaxWidth;

    /**
     * Configures the drop down list item height
     *
     * ```typescript
     * // get
     * let myComboItemHeight = this.combo.itemHeight;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [itemHeight]='32'></igx-combo>
     * ```
     */
    @Input()
    public itemHeight = 32;

    /**
     * @hidden
     */
    public filteringLogic = FilteringLogic.Or;

    /**
     * Defines the placeholder value for the combo value field
     *
     * ```typescript
     * // get
     * let myComboPlaceholder = this.combo.placeholder;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [placeholder]='newPlaceHolder'></igx-combo>
     * ```
     */
    @Input()
    public placeholder = '';

    /**
     * Defines the placeholder value for the combo dropdown search field
     *
     * ```typescript
     * // get
     * let myComboSearchPlaceholder = this.combo.searchPlaceholder;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [searchPlaceholder]='newPlaceHolder'></igx-combo>
     * ```
     */
    @Input()
    public searchPlaceholder = 'Enter a Search Term';

    /**
     * Combo data source.
     *
     * ```html
     * <!--set-->
     * <igx-combo [data]='items'></igx-combo>
     * ```
     */
    @Input()
    public data = [];

    /**
     * Combo value data source propery.
     *
     * ```typescript
     * // get
     * let myComboValueKey = this.combo.valueKey;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [valueKey]='myKey'></igx-combo>
     * ```
     */
    @Input()
    public valueKey: string | number = '';

    @Input()
    set displayKey(val: string | number) {
        this._displayKey = val;
    }

    /**
     * Combo text data source propery.
     *
     * ```typescript
     * // get
     * let myComboDisplayKey = this.combo.displayKey;
     *
     * // set
     * this.combo.displayKey = 'val';
     *
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [displayKey]='mydisplayKey'></igx-combo>
     * ```
     */
    get displayKey() {
        return this._displayKey ? this._displayKey : this.valueKey;
    }

    /**
     * Combo item group
     *
     * ```html
     * <!--set-->
     * <igx-combo [groupKey]='newGroupKey'></igx-combo>
     * ```
     */
    @Input()
    public set groupKey(val: string | number) {
        this.clearSorting(this._groupKey);
        this._groupKey = val;
        this.sort(this._groupKey);
    }

    /**
     * Combo item group
     *
     * ```typescript
     * // get
     * let currentGroupKey = this.combo.groupKey;
     * ```
     */
    public get groupKey(): string | number {
        return this._groupKey;
    }

    @Input()
    public filterable = true;

    @Input()
    public ariaLabelledBy: string;

    @Input()
    public disabled = false;

    @HostListener('keydown.ArrowDown', ['$event'])
    @HostListener('keydown.Alt.ArrowDown', ['$event'])
    onArrowDown(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (this.dropdown.collapsed) {
            this.toggle();
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.ArrowUp', ['$event'])
    @HostListener('keydown.Alt.ArrowUp', ['$event'])
    onArrowUp(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (!this.dropdown.collapsed) {
            this.toggle();
        }
    }

    /**
     * @hidden
     */
    onInputClick(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        this.toggle();
    }

    get virtualizationState(): IForOfState {
        return this.dropdown.verticalScrollContainer.state;
    }
    set virtualizationState(state) {
        this.dropdown.verticalScrollContainer.state = state;
    }

    get totalItemCount() {
        return this.dropdown.verticalScrollContainer.totalItemCount;
    }
    set totalItemCount(count) {
        this.dropdown.verticalScrollContainer.totalItemCount = count;
        this.cdr.detectChanges();
    }

    /**
     * @hidden
     */
    public get values(): any[] {
        return this.valueKey !== undefined ? this.selectedItems().map((e) => e[this.valueKey]) : [];
    }

    /**
     * @hidden
     */
    public get filteringExpressions() {
        return this._filteringExpressions;
    }

    /**
     * @hidden
     */
    public set filteringExpressions(value) {
        this._filteringExpressions = cloneArray(value);
        this.cdr.markForCheck();
    }

    /**
     * @hidden
     */
    public get sortingExpressions() {
        return this._sortingExpressions;
    }

    /**
     * @hidden
     */
    public set sortingExpressions(value) {
        this._sortingExpressions = cloneArray(value);
        this.cdr.markForCheck();
    }

    /**
     * @hidden
     */
    protected clearSorting(field?: string | number) {
        if (field === undefined || field === null) {
            this.sortingExpressions = [];
            return;
        }
        const currentState = cloneArray(this.sortingExpressions);
        const index = currentState.findIndex((expr) => expr.fieldName === field);
        if (index > -1) {
            currentState.splice(index, 1);
            this.sortingExpressions = currentState;
        }
    }

    /**
     * Combo value
     *
     * ```typescript
     * // get
     * let comboValue = this.combo.value;
     * ```
     */
    get value(): string {
        return this._value;
    }
    /**
     * Combo value
     *
     * ```html
     * <!--set-->
     * <igx-combo [value]='newValue'></igx-combo>
     * ```
     */
    set value(val) {
        this._value = val;
    }

    /**
     * @hidden
     */
    get searchValue() {
        return this._searchValue;
    }

    /**
     * @hidden
     */
    set searchValue(val: string) {
        this._searchValue = val;
    }

    /**
     * @hidden
     */
    public get filteredData(): any[] {
        return this._filteredData;
    }

    /**
     * @hidden
     */
    public set filteredData(val: any[]) {
        this._filteredData = this.groupKey ? (val || []).filter((e) => e.isHeader !== true) : val;
        this.checkMatch();
    }

    /**
     * @hidden
     */
    public handleKeyUp(evt) {
        if (evt.key === 'ArrowDown' || evt.key === 'Down') {
            this.dropdownContainer.nativeElement.focus();
            this.dropdown.onFocus();
            this.dropdown.focusedItem = this.dropdown.items[0];
        } else if (evt.key === 'Escape' || evt.key === 'Esc') {
            this.toggle();
        }
    }

    private checkMatch() {
        this.customValueFlag = this.displayKey || this.displayKey === 0 ?
            !this.filteredData
                .some((e) => (e[this.displayKey]).toString().toLowerCase() === this.searchValue.trim().toLowerCase()) &&
            this.allowCustomValues :
            !this.filteredData
                .some((e) => e.toString().toLowerCase() === this.searchValue.trim().toLowerCase()) && this.allowCustomValues;
    }

    /**
     * @hidden
     */
    public handleInputChange(event?) {
        if (this.filterable) {
            this.filter(this.searchValue.trim(), IgxStringFilteringOperand.instance().condition('contains'),
                true, this.dataType === DataTypes.PRIMITIVE ? undefined : this.displayKey);
            // this.isHeaderChecked();
        }
        if (event) {
            this.onSearchInput.emit(event);
        }
    }

    /**
     * @hidden
     */
    public sort(fieldName: string | number, dir: SortingDirection = SortingDirection.Asc, ignoreCase: boolean = true): void {
        if (!fieldName && fieldName !== 0) {
            return;
        }
        const sortingState = cloneArray(this.sortingExpressions, true);

        this.prepare_sorting_expression(sortingState, fieldName, dir, ignoreCase);
        this.sortingExpressions = sortingState;
    }

    /**
     * @hidden
     */
    public getItemDataByValueKey(val: any): any {
        if (!val && val !== 0) {
            return undefined;
        }
        return this.valueKey === 0 || this.valueKey ?
            this.data.filter((e) => e[this.valueKey] === val)[0] :
            this.data.filter((e) => e === val);
    }

    /**
     * @hidden
     */
    protected prepare_sorting_expression(state, fieldName, dir, ignoreCase) {

        if (dir === SortingDirection.None) {
            state.splice(state.findIndex((expr) => expr.fieldName === fieldName), 1);
            return;
        }

        const expression = state.find((expr) => expr.fieldName === fieldName);

        if (!expression) {
            state.push({ fieldName, dir, ignoreCase });
        } else {
            Object.assign(expression, { fieldName, dir, ignoreCase });
        }
    }

    /**
     * @hidden
     */
    public get dataType(): string {
        if (this.valueKey) {
            return DataTypes.COMPLEX;
        }
        return DataTypes.PRIMITIVE;
    }

    private changeSelectedItem(newItem: any, select?: boolean) {
        if (!newItem && newItem !== 0) {
            return;
        }
        const newSelection = select ?
            this.selectionAPI.select_item(this.id, newItem) :
            this.selectionAPI.deselect_item(this.id, newItem);
        this.triggerSelectionChange(newSelection);
    }

    /**
     * @hidden
     */
    public setSelectedItem(itemID: any, select = true) {
        if (itemID === undefined || itemID === null) {
            return;
        }
        const newItem = this.dropdown.items.find((item) => item.itemID === itemID);
        if (newItem) {
            if (newItem.disabled || newItem.isHeader) {
                return;
            }
            if (!newItem.isSelected) {
                this.changeSelectedItem(itemID, true);
            } else {
                this.changeSelectedItem(itemID, false);
            }
        } else {
            const target = typeof itemID === 'object' ? itemID : this.getItemDataByValueKey(itemID);
            if (target) {
                this.changeSelectedItem(target, select);
            }
        }
    }

    /**
     * @hidden
     */
    public isItemSelected(item) {
        return this.selectionAPI.is_item_selected(this.id, item);
    }

    /**
     * @hidden
     */
    protected triggerSelectionChange(newSelection) {
        const oldSelection = this.dropdown.selectedItem;
        if (oldSelection !== newSelection) {
            const args: IComboSelectionChangeEventArgs = { oldSelection, newSelection };
            this.onSelectionChange.emit(args);
            this.selectionAPI.set_selection(this.id, newSelection);
            this.value = this._dataType !== DataTypes.PRIMITIVE ?
                newSelection.map((e) => e[this.displayKey]).join(', ') :
                newSelection.join(', ');
            // this.isHeaderChecked();
            this._onChangeCallback(newSelection);
        }
    }

    /**
     * @hidden
     */
    public triggerCheck() {
        this.cdr.detectChanges();
    }

    /**
     * @hidden
     */
    public isAddButtonVisible(): boolean {
        return this.searchValue && this.customValueFlag;
    }

    /**
     * @hidden
     */
    public handleSelectAll(evt) {
        if (evt.checked) {
            this.selectAllItems();
        } else {
            this.deselectAllItems();
        }
    }

    /**
     * @hidden
     */
    public addItemToCollection() {
        if (!this.searchValue) {
            return false;
        }
        const newValue = this.searchValue.trim();
        const addedItem = this.displayKey ? {
            [this.valueKey]: newValue,
            [this.displayKey]: newValue
        } : newValue;
        const oldCollection = this.data;
        const newCollection = [...this.data];
        newCollection.push(addedItem);
        const args: IComboItemAdditionEvent = {
            oldCollection, addedItem, newCollection
        };
        this.onAddition.emit(args);
        this.data.push(addedItem);
        this.changeSelectedItem(addedItem, true);
        this.customValueFlag = false;
        if (this.searchInput) {
            this.searchInput.nativeElement.focus();
        }
        this.handleInputChange();
    }

    /**
     * @hidden
     */
    protected prepare_filtering_expression(searchVal, condition, ignoreCase, fieldName?) {
        const newArray = [...this.filteringExpressions];
        const expression = newArray.find((expr) => expr.fieldName === fieldName);
        const newExpression = { fieldName, searchVal, condition, ignoreCase };
        if (!expression) {
            newArray.push(newExpression);
        } else {
            Object.assign(expression, newExpression);
        }
        if (this.groupKey) {
            const expression2 = newArray.find((expr) => expr.fieldName === 'isHeader');
            const headerExpression = {
                fieldName: 'isHeader', searchVale: '',
                condition: IgxBooleanFilteringOperand.instance().condition('true'), ignoreCase: true
            };
            if (!expression2) {
                newArray.push(headerExpression);
            } else {
                Object.assign(expression2, headerExpression);
            }
        }
        this.filteringExpressions = newArray;
    }

    /**
     * @hidden
     */
    public filter(term, condition, ignoreCase, valueKey?) {
        this.prepare_filtering_expression(term, condition, ignoreCase, valueKey);
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        this.id += currentItem++;
        this.selectionAPI.set_selection(this.id, []);
        this.overlaySettings.positionStrategy.settings.target = this.elementRef.nativeElement;
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        this.filteredData = [...this.data];
    }

    /**
     * @hidden
     */
    public dataLoading(event) {
        this.onDataPreLoad.emit(event);
    }

    /**
     * @hidden
     */
    public writeValue(value: any): void {
        this.selectItems(value, true);
    }

    /**
     * @hidden
     */
    public registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    /**
     * @hidden
     */
    public registerOnTouched(fn: any): void { }

    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /**
     * @hidden
     */
    public get template(): TemplateRef<any> {
        this._dataType = this.dataType;
        if (!this.filteredData || !this.filteredData.length) {
            return this.emptyTemplate;
        }
        if (this.itemTemplate) {
            return this.itemTemplate;
        }
        if (this._dataType === DataTypes.COMPLEX) {
            return this.complexTemplate;
        }
        return this.primitiveTemplate;
    }

    /**
     * @hidden
     */
    public get context(): any {
        return {
            $implicit: this
        };
    }

    public toggle() {
        this.searchValue = '';
        this.dropdown.toggle(this.overlaySettings);
    }

    public open() {
        this.searchValue = '';
        this.dropdown.open(this.overlaySettings);
    }

    public close() {
        this.dropdown.close();
    }

    public get collapsed() {
        return this.dropdown.collapsed;
    }

    public selectedItems() {
        return this.dropdown.selectedItem;
    }

    public selectItems(newItems: Array<any>, clearCurrentSelection?: boolean) {
        if (newItems) {
            const newSelection = clearCurrentSelection ? newItems : this.selectionAPI.select_items(this.id, newItems);
            this.triggerSelectionChange(newSelection);
        }
    }

    public deselectItems(newItems: Array<any>) {
        if (newItems) {
            const newSelection = this.selectionAPI.deselect_items(this.id, newItems);
            this.triggerSelectionChange(newSelection);
        }
    }

    public selectAllItems(ignoreFilter?: boolean) {
        const allVisible = this.selectionAPI.get_all_ids(ignoreFilter ? this.data : this.filteredData);
        const newSelection = this.selectionAPI.select_items(this.id, allVisible);
        this.triggerSelectionChange(newSelection);
    }

    public deselectAllItems(ignoreFilter?: boolean) {
        const newSelection = this.filteredData.length === this.data.length || ignoreFilter ?
            [] :
            this.selectionAPI.deselect_items(this.id, this.selectionAPI.get_all_ids(this.filteredData));
        this.triggerSelectionChange(newSelection);
    }
}

@NgModule({
    declarations: [IgxComboComponent, IgxComboItemComponent, IgxComboFilterConditionPipe, IgxComboGroupingPipe,
        IgxComboFilteringPipe, IgxComboSortingPipe, IgxComboDropDownComponent],
    exports: [IgxComboComponent, IgxComboItemComponent, IgxComboDropDownComponent],
    imports: [IgxRippleModule, CommonModule, IgxInputGroupModule, FormsModule, ReactiveFormsModule,
        IgxForOfModule, IgxToggleModule, IgxCheckboxModule, IgxDropDownModule, IgxButtonModule, IgxIconModule],
    providers: [IgxSelectionAPIService]
})
export class IgxComboModule { }
