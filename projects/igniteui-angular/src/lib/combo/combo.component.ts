import { CommonModule } from '@angular/common';
import {
    AfterViewInit, ChangeDetectorRef, Component, ContentChild,
    ContentChildren, ElementRef, EventEmitter, forwardRef,
    HostBinding, HostListener, Inject, Input, NgModule, OnInit, Output, QueryList, TemplateRef, ViewChild, ViewChildren
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { take } from 'rxjs/operators';
import { IgxCheckboxComponent, IgxCheckboxModule } from '../checkbox/checkbox.component';
import { IToggleView } from '../core/navigation';
import { IgxSelectionAPIService } from '../core/selection';
import { cloneArray } from '../core/utils';
import { IgxStringFilteringOperand, IgxBooleanFilteringOperand } from '../data-operations/filtering-condition';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxForOfDirective, IgxForOfModule } from '../directives/for-of/for_of.directive';
import { IForOfState } from '../directives/for-of/IForOfState';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxDropDownItemBase } from '../drop-down/drop-down-item.component';
import { IgxDropDownBase, IgxDropDownComponent, IgxDropDownModule, Navigate } from '../drop-down/drop-down.component';
import { IgxIconModule } from '../icon/index';
import { IgxInputGroupModule } from '../input-group/input-group.component';
import { IgxComboItemComponent } from './combo-item.component';
import { IgxComboFilterConditionPipe, IgxComboFilteringPipe, IgxComboGroupingPipe, IgxComboSortingPipe } from './combo.pipes';

export enum DataTypes {
    EMPTY = 'empty',
    PRIMITIVE = 'primitive',
    COMPLEX = 'complex',
    PRIMARYKEY = 'valueKey'
}

export interface IComboDropDownOpenEventArgs {
    event?: Event;
}

export interface IComboDropDownClosedEventArgs {
    event?: Event;
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
    selector: 'igx-combo-drop-down',
    templateUrl: '../drop-down/drop-down.component.html'
})
export class IgxComboDropDownComponent extends IgxDropDownBase {
    private _isFocused = false;
    private _children: QueryList<IgxDropDownItemBase>;
    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selectionAPI: IgxSelectionAPIService,
        @Inject(forwardRef(() => IgxComboComponent))
        public parentElement: IgxComboComponent) {
        super(elementRef, cdr, selectionAPI);
        this.allowItemsFocus = false;
    }

    /**
     * @hidden
     */
    protected get scrollContainer() {
        return this.verticalScrollContainer.dc.location.nativeElement;
    }

    /**
     * Event emitter overrides
     * 
     * @hidden
     */
    public onOpened = this.parentElement.onOpened;

    /**
     * @hidden
     */
    public onOpening = this.parentElement.onOpening;

    /**
     * @hidden
     */
    public onClosing = this.parentElement.onClosing;

    /**
     * @hidden
     */
    public onClosed = this.parentElement.onClosed;

    /**
     * @hidden
     */
    @ContentChild(forwardRef(() => IgxForOfDirective), { read: IgxForOfDirective })
    public verticalScrollContainer: IgxForOfDirective<any>;

    /**
     * @hidden
     */
    protected get children(): QueryList<IgxDropDownItemBase> {
        return this.parentElement.children;
    }

    protected set children(val: QueryList<IgxDropDownItemBase>) {
        this._children = val;
    }

    /**
     * @hidden
     */
    onFocus() {
        this._isFocused = true;
        this._focusedItem = this._focusedItem ? this._focusedItem : this.items.length ? this.items[0] : this.children.first;
        if (this._focusedItem) {
            this._focusedItem.isFocused = true;
        }
    }

    /**
     * @hidden
     */
    onBlur(evt?) {
        this._isFocused = false;
        if (this._focusedItem) {
            this._focusedItem.isFocused = false;
            this._focusedItem = null;
        }
    }

    /**
     * @hidden
     */
    public get selectedItem(): any[] {
        return this.selectionAPI.get_selection(this.parentElement.id) || [];
    }

    /**
     * @hidden
     */
    navigatePrev() {
        if (this._focusedItem.index === 0 && this.verticalScrollContainer.state.startIndex === 0) {
            this.parentElement.searchInput.nativeElement.focus();
        } else {
            super.navigatePrev();
        }
    }

    navigateFirst() {
        const vContainer = this.verticalScrollContainer;
        vContainer.scrollTo(0);
        this.subscribeNext(vContainer, () => {
            this.focusItem(0);
        });
    }

    navigateLast() {
        const vContainer = this.verticalScrollContainer;
        vContainer.scrollTo(vContainer.igxForOf.length);
        this.subscribeNext(vContainer, () => {
            this.focusItem(this.items.length - 1);
        });
    }

    setSelectedItem(itemID: any, select = true) {
        this.parentElement.setSelectedItem(itemID, select);
    }

    /**
     * @hidden
     */
    selectItem(item: IgxComboItemComponent) {
        if (item.itemData === 'ADD ITEM') {
            this.parentElement.addItemToCollection();
        } else {
            this.setSelectedItem(item.itemID);
            this._focusedItem = item;
        }
    }

    navigateItem(newIndex: number, direction?: number) {
        // Virtual scrolling holds one hidden loaded element at the bottom of the drop down list.
        // At the top there isn't such a hidden element.
        // That's why we hold the first or the one before the last list item as focused, during keyboard navigation.
        // This means that if we want to focus next element, it's the last hidden element when scrolling down
        // and when scrolling up it is not loaded at all.
        // It's more special case when srcolling down and the hidden element is group header,
        // which is not part of the this.items collection.
        // In that case the real item is not hidden, but not loaded at all by the virtualization,
        // and this is the same case as normal scroll up.
        const mod = this.parentElement.customValueFlag && this.parentElement.searchValue !== '';
        if (direction) {
            if (direction === Navigate.Down
                && this.focusedItem.itemData === this.verticalScrollContainer.igxForOf[this.verticalScrollContainer.igxForOf.length - 1]
                && mod) {
                    if (this.focusedItem) {
                        this.focusedItem.isFocused = false;
                    }
                    this.focusedItem = this.children.last;
                    this.focusedItem.isFocused = true;
                    return;
                }
        }
        if (newIndex === -1 || newIndex === this.items.length - 1) {
            this.navigateVirtualItem(direction, mod ? 1 : 0);
        } else {
            super.navigateItem(newIndex);
        }
    }

    private navigateVirtualItem(direction: Navigate, mod?: number) {
        const vContainer = this.verticalScrollContainer;
        let state = vContainer.state;
        const isScrollUp = direction === Navigate.Up;
        let newScrollStartIndex = isScrollUp ? state.startIndex - 1 : state.startIndex + 1;
        if (newScrollStartIndex < 0) {
            newScrollStartIndex = 0;
        }
        let data = vContainer.igxForOf;

        if (data.length === 0) {
            const newItem = this.children.first;
            if (!newItem) { return; }
            newItem.isFocused = true;
            this._focusedItem = newItem;
            return;
        }
        // Following the big comment above, when the new item is group header, then we need to load 2 elements at once.
        if (data[newScrollStartIndex].isHeader && direction === Navigate.Up ||
            data[newScrollStartIndex + state.chunkSize - 2].isHeader && direction === Navigate.Down) {
            newScrollStartIndex = isScrollUp ? newScrollStartIndex - 1 : newScrollStartIndex + 1;
            // newScrollStartIndex = mod && direction === Navigate.Down ? newScrollStartIndex + 1 : newScrollStartIndex;
            if (newScrollStartIndex < 0) { // If the next item loaded is a header and is also the very first item in the list.
                vContainer.scrollTo(0); // Scrolls to the beginning of the list and switches focus to the searchInput
                this.subscribeNext(vContainer, () => {
                    this.parentElement.searchInput.nativeElement.focus();
                    this.focusedItem.isFocused = false;
                    this.focusedItem = null;
                });
                return;
            }
        }
        vContainer.scrollTo(newScrollStartIndex);
        this.subscribeNext(vContainer, () => {
            state = vContainer.state;
            data = vContainer.igxForOf;

            // Because we are sure that if we scroll up then the top element is not a header, then we focus the first one.
            // When we scroll down, if the newly loaded element that is hidden is group header,
            // then we focus the last item from the this.items array.
            // This is because the this.items doens't contains the group headers, while there are rendered in the combo drop down.
            // If the newly loaded element that is hidden isn't a header, this means that the first visible item, the one that needs focus,
            // should be either the one that is before the last item (this.items).
            const isBottomHiddenHeader = data[state.startIndex + state.chunkSize - 1].isHeader;
            const index = isScrollUp ? 0 : isBottomHiddenHeader ? this.items.length - 1 - mod : this.items.length - 2 - mod;

            this.focusItem(index);
        });
    }

    private subscribeNext(virtualContainer: any, callback: (elem?) => void) {
        virtualContainer.onChunkLoad.pipe(take(1)).subscribe({
            next: (e: any) => {
                callback(e);
            }
        });
    }

    private focusItem(visibleIndex: number) {
        const oldItem = this._focusedItem;
        if (oldItem) {
            oldItem.isFocused = false;
        }
        const newItem = this.items[visibleIndex];
        newItem.isFocused = true;
        this._focusedItem = newItem;
    }

    onToggleOpening() {
        this.parentElement.searchValue = '';
        this.parentElement.handleInputChange();
        this.onOpening.emit();
    }

    /**
     * @hidden
     */
    onToggleOpened() {
        this.parentElement.triggerCheck();
        this.parentElement.searchInput.nativeElement.focus();
        this.onOpened.emit();
    }

    /**
     * @hidden
     */
    onToggleClosed() {
        this.parentElement.comboInput.nativeElement.focus();
        this.onClosed.emit();
    }
}
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
    protected _textKey: string | number = '';
    private _dataType = '';
    // private _data: any[] = [];
    private _filteredData = [];
    private _children: QueryList<IgxDropDownItemBase>;
    private _dropdownContainer: ElementRef = null;
    private _searchInput: ElementRef<HTMLInputElement> = null;
    private _comboInput: ElementRef = null;
    private _onChangeCallback: (_: any) => void = noop;

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
    set comboInput(content: ElementRef) {
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
    @ViewChild('empty', { read: TemplateRef })
    protected emptyTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild('dropdownHeader', { read: TemplateRef })
    public dropdownHeader: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild('dropdownFooter', { read: TemplateRef })
    public dropdownFooter: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild('dropdownItemTemplate', { read: TemplateRef })
    public dropdownItemTemplate: TemplateRef<any>;

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
    public get children(): QueryList<IgxDropDownItemBase> {
        return this._children;
    }

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
    @ViewChildren(IgxComboItemComponent, { read: IgxComboItemComponent })
    public set children(list: QueryList<IgxDropDownItemBase>) {
        this._children = list;
    }

    /**
     * Emitted when item selection is changing, before the selection completes
     *
     * ```html
     * <igx-combo (onSelection)='handleSelection()'></igx-combo>
     * ```
     */
    @Output()
    public onSelection = new EventEmitter<IComboSelectionChangeEventArgs>();

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
    public onAddition = new EventEmitter();

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
    public width = '250px';

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
     * let myComboDropDownHeight = this.combo.dropDownHeight;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [dropDownHeight]='320'></igx-combo>
     * ```
     */
    @Input()
    public dropDownHeight = 320;

    /**
     * Configures the drop down list item height
     *
     * ```typescript
     * // get
     * let myComboDropDownWidth = this.combo.dropDownWidth;
     * ```
     * 
     * ```html
     * <!--set-->
     * <igx-combo [dropDownWidth] = '80'></igx-combo>
     * ```
     */
    @Input()
    public dropDownWidth = this.width;

    /**
     * Gets/sets a property by which the items from the collection should be grouped
     *
     * ```typescript
     * // get
     * let myComboDropDownItemHeight = this.combo.dropDownItemHeight;
     * ```
     * 
     * ```html
     * <!--set-->
     * <igx-combo [dropDownItemHeight]='32'></igx-combo>
     * ```
     */
    @Input()
    public dropDownItemHeight = 32;

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
     * @hidden
     */
    @Input()
    public defaultFallbackGroup = 'Other';

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
    // public set data(val: any[]) {
    //     this._data = val || [];
    // }

    // public get data(): any[] {
    //     return this._data;
    // }

    /**
     * @hidden
     */
    @Input()
    public filteringLogic = FilteringLogic.Or;

    /**
     * @hidden
     */
    @Input()
    set textKey(val: string | number) {
        this._textKey = val;
    }

    /**
     * @hidden
     */
    get textKey() {
        return this._textKey ? this._textKey : this.valueKey;
    }

    /**
     * @hidden
     */
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
            this.dropdown.toggle();
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
            this.dropdown.toggle();
        }
    }

    /**
     * @hidden
     */
    onInputClick(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        this.dropdown.toggle();
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
    public handleKeyDown(evt) {
        if (evt.key === 'ArrowDown' || evt.key === 'Down') {
            this.dropdownContainer.nativeElement.focus();
            this.dropdown.onFocus();
            this.dropdown.focusedItem = this.dropdown.items[0];
        } else if (evt.key === 'Escape' || evt.key === 'Esc') {
            this.toggle();
        }
    }

    private checkMatch() {
        this.customValueFlag = this.textKey || this.textKey === 0 ?
            !this.filteredData
                .some((e) => (e[this.textKey]).toString().toLowerCase() === this.searchValue.trim().toLowerCase()) &&
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
                true, this.dataType === DataTypes.PRIMITIVE ? undefined : this.textKey);
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
            if (newItem.isDisabled || newItem.isHeader) {
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

    // private isHeaderChecked() {
    //     if (!this.selectAllCheckbox) {
    //         return false;
    //     }
    //     const selectedItems = this.dropdown.selectedItem;
    //     if (this.filteredData.length > 0 && selectedItems.length > 0) {
    //         const compareData = this.filteredData;
    //         if (selectedItems.length >= this.filteredData.length) {
    //             let areAllSelected = true;
    //             let indeterminateFlag = false;
    //             for (const item of compareData) {
    //                 if (areAllSelected && !indeterminateFlag) {
    //                     indeterminateFlag = selectedItems.indexOf(item) > -1;
    //                 }
    //                 if (areAllSelected && indeterminateFlag) {
    //                     if (selectedItems.indexOf(item) < 0) {
    //                         areAllSelected = false;
    //                         this.selectAllCheckbox.indeterminate = indeterminateFlag;
    //                         this.selectAllCheckbox.checked = false;
    //                         return;
    //                     }
    //                 }
    //             }
    //             this.selectAllCheckbox.indeterminate = false;
    //             this.selectAllCheckbox.checked = true;
    //             return;
    //         } else if (selectedItems.length < this.filteredData.length) {
    //             for (const item of selectedItems) {
    //                 if (compareData.indexOf(item) > -1) {
    //                     this.selectAllCheckbox.indeterminate = true;
    //                     return;
    //                 }
    //             }
    //             this.selectAllCheckbox.checked = false;
    //             this.selectAllCheckbox.indeterminate = false;
    //             return;
    //         }
    //     }
    //     this.selectAllCheckbox.indeterminate = false;
    //     this.selectAllCheckbox.checked = false;
    // }

    /**
     * @hidden
     */
    protected triggerSelectionChange(newSelection) {
        const oldSelection = this.dropdown.selectedItem;
        if (oldSelection !== newSelection) {
            const args: IComboSelectionChangeEventArgs = { oldSelection, newSelection };
            this.onSelection.emit(args);
            this.selectionAPI.set_selection(this.id, newSelection);
            this.value = this._dataType !== DataTypes.PRIMITIVE ?
                newSelection.map((e) => e[this.textKey]).join(', ') :
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
        const addedItem = this.textKey ? {
            [this.valueKey]: newValue,
            [this.textKey]: newValue
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

    public ngOnInit() {
        this.id += currentItem++;
        this.selectionAPI.set_selection(this.id, []);
    }

    public ngAfterViewInit() {
        this.filteredData = [...this.data];
        if (this.disabled) {
            this.setDisabledState(true);
        }
    }

    /**
     * @hidden
     */
    public writeValue(value: any): void {
        this.selectItems(value);
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

    /**
     * @hidden
     */
    public setDisabledState(isDisabled: boolean): void { }

    /**
     * @hidden
     */
    public get template(): TemplateRef<any> {
        this._dataType = this.dataType;
        if (!this.filteredData || !this.filteredData.length) {
            return this.emptyTemplate;
        }
        if (this.dropdownItemTemplate) {
            return this.dropdownItemTemplate;
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

    /**
     * @hidden
     */
    public toggle() {
        this.dropdown.toggle();
    }

    /**
     * @hidden
     */
    public open() {
        this.dropdown.open();
    }

    /**
     * @hidden
     */
    public close() {
        this.dropdown.close();
    }

    /**
     * @hidden
     */
    public get collapsed() {
        return this.dropdown.collapsed;
    }

    /**
     * @hidden
     */
    public selectedItems() {
        return this.dropdown.selectedItem;
    }

    /**
     * @hidden
     */
    public selectItems(newItems: Array<any>, clearCurrentSelection?: boolean) {
        if (newItems) {
            const newSelection = clearCurrentSelection ? newItems : this.selectionAPI.select_items(this.id, newItems);
            this.triggerSelectionChange(newSelection);
        }
    }

    /**
     * @hidden
     */
    public deselectItems(newItems: Array<any>) {
        if (newItems) {
            const newSelection = this.selectionAPI.deselect_items(this.id, newItems);
            this.triggerSelectionChange(newSelection);
        }
    }

    /**
     * @hidden
     */
    public selectAllItems(ignoreFilter?: boolean) {
        const allVisible = this.selectionAPI.get_all_ids(ignoreFilter ? this.data : this.filteredData);
        const newSelection = this.selectionAPI.select_items(this.id, allVisible);
        this.triggerSelectionChange(newSelection);
    }

    /**
     * @hidden
     */
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
        IgxForOfModule, IgxToggleModule, IgxCheckboxModule, IgxDropDownModule, IgxIconModule],
    providers: [IgxSelectionAPIService]
})
export class IgxComboModule { }
