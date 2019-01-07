import { ConnectedPositioningStrategy } from './../services/overlay/position/connected-positioning-strategy';
import { CommonModule } from '@angular/common';
import {
    AfterViewInit, ChangeDetectorRef, Component, ContentChild,
    ElementRef, EventEmitter,
    HostBinding, HostListener, Input, NgModule, OnInit, OnDestroy, Output, QueryList,
    TemplateRef, ViewChild, ViewChildren, Optional, Self, Inject, Directive
} from '@angular/core';
import {
    IgxComboItemDirective,
    IgxComboEmptyDirective,
    IgxComboHeaderItemDirective,
    IgxComboHeaderDirective,
    IgxComboFooterDirective,
    IgxComboAddItemDirective
} from './combo.directives';
import { FormsModule, ReactiveFormsModule, ControlValueAccessor, NgControl } from '@angular/forms';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { IgxSelectionAPIService } from '../core/selection';
import { cloneArray, CancelableEventArgs } from '../core/utils';
import { IgxStringFilteringOperand, IgxBooleanFilteringOperand } from '../data-operations/filtering-condition';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { SortingDirection, ISortingExpression } from '../data-operations/sorting-expression.interface';
import { IgxForOfModule, IForOfState } from '../directives/for-of/for_of.directive';
import { IgxIconModule } from '../icon/index';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxDropDownModule } from '../drop-down/drop-down.component';
import { IgxInputGroupModule } from '../input-group/input-group.component';
import { IgxComboItemComponent } from './combo-item.component';
import { IgxComboDropDownComponent } from './combo-dropdown.component';
import { IgxComboFilterConditionPipe, IgxComboFilteringPipe, IgxComboGroupingPipe, IgxComboSortingPipe } from './combo.pipes';
import { OverlaySettings, AbsoluteScrollStrategy } from '../services';
import { Subject } from 'rxjs';
import { DeprecateProperty } from '../core/deprecateDecorators';
import { DefaultSortingStrategy, ISortingStrategy } from '../data-operations/sorting-strategy';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import { IGX_COMBO_COMPONENT, IgxComboBase } from './combo.common';
import { IgxDropDownSelectionService } from '../drop-down/drop-down.selection';
import { takeUntil, filter } from 'rxjs/operators';
import { IgxComboAddItemComponent } from './combo-add-item.component';
import { IgxComboAPIService } from './combo.api';

/** Custom strategy to provide the combo with callback on initial positioning */
class ComboConnectedPositionStrategy extends ConnectedPositioningStrategy {
    private _callback: () => void;
    constructor(callback: () => void) {
        super();
        this._callback = callback;
    }

    position(contentElement, size, document?, initialCall?) {
        if (initialCall) {
            this._callback();
        }
        super.position(contentElement, size);
    }
}

/**
 * @hidden
 */
enum DataTypes {
    EMPTY = 'empty',
    PRIMITIVE = 'primitive',
    COMPLEX = 'complex',
    PRIMARYKEY = 'valueKey'
}

export enum IgxComboState {
    /**
     * Combo with initial state.
     */
    INITIAL,
    /**
     * Combo with valid state.
     */
    VALID,
    /**
     * Combo with invalid state.
     */
    INVALID
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

let NEXT_ID = 0;
const noop = () => { };

@Component({
    selector: 'igx-combo',
    templateUrl: 'combo.component.html',
    providers: [{ provide: IGX_COMBO_COMPONENT, useExisting: IgxComboComponent }, IgxComboAPIService]
})
export class IgxComboComponent extends DisplayDensityBase implements IgxComboBase, AfterViewInit, ControlValueAccessor, OnInit, OnDestroy {
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
    protected _filteringExpressions: IFilteringExpression[] = [];
    /**
     * @hidden
     */
    protected _sortingExpressions: ISortingExpression[] = [];
    /**
     * @hidden
     */
    protected _groupKey = '';
    /**
     * @hidden
     */
    protected _displayKey: string;
    private _dataType = '';
    private destroy$ = new Subject<any>();
    private _data = [];
    private _filteredData = [];
    private _positionCallback: () => void;
    private _onChangeCallback: (_: any) => void = noop;
    private overlaySettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };
    private _value = '';
    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        @Inject(IgxDropDownSelectionService) protected selection: IgxDropDownSelectionService,
        protected comboAPI: IgxComboAPIService,
        @Self() @Optional() public ngControl: NgControl,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
        super(_displayDensityOptions);
        if (this.ngControl) {
            // Note: we provide the value accessor through here, instead of
            // the `providers` to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }
        this.comboAPI.register(this);
    }

    /**
     * @hidden
     */
    @ViewChild(IgxComboDropDownComponent, { read: IgxComboDropDownComponent })
    public dropdown: IgxComboDropDownComponent;

    /**
     * @hidden
     */
    @ViewChild('searchInput')
    public searchInput: ElementRef<HTMLInputElement> = null;

    /**
     * @hidden
     */
    @ViewChild('comboInput')
    public comboInput: ElementRef<HTMLInputElement> = null;

    /**
     * @hidden
     */
    get displaySearchInput(): boolean {
        return this.filterable || this.allowCustomValues;
    }

    @ContentChild(IgxComboItemDirective, { read: TemplateRef })
    public itemTemplate: TemplateRef<any> = null;

    @ContentChild(IgxComboHeaderDirective, { read: TemplateRef })
    public headerTemplate: TemplateRef<any> = null;

    @ContentChild(IgxComboFooterDirective, { read: TemplateRef })
    public footerTemplate: TemplateRef<any> = null;

    @ContentChild(IgxComboHeaderItemDirective, { read: TemplateRef })
    public headerItemTemplate: TemplateRef<any> = null;

    @ContentChild(IgxComboAddItemDirective, { read: TemplateRef })
    public addItemTemplate: TemplateRef<any> = null;

    @ContentChild(IgxComboEmptyDirective, { read: TemplateRef })
    public emptyTemplate: TemplateRef<any> = null;
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
    @DeprecateProperty(`Setting combo item template with '#emptyTemplate' is deprecated.\n` +
        `Use \`igxComboEmpty\` directive instead.`)
    @ContentChild('emptyTemplate', { read: TemplateRef })
    private set oldEmptyTemplate(template: TemplateRef<any>) {
        if (template) {
            this.emptyTemplate = template;
        }
    }

    /**
     * @hidden
     */
    @DeprecateProperty(`Setting combo item template with '#headerTemplate' is deprecated.\n` +
        `Use \`igxComboHeader\` directive instead.`)
    @ContentChild('headerTemplate', { read: TemplateRef })
    private set oldHeaderTemplate(template: TemplateRef<any>) {
        if (template) {
            this.headerTemplate = template;
        }
    }

    /**
     * @hidden
     */
    @DeprecateProperty(`Setting combo item template with '#footerTemplate' is deprecated.\n` +
        `Use \`igxComboFooter\` directive instead.`)
    @ContentChild('footerTemplate', { read: TemplateRef })
    private set oldFooterTemplate(template: TemplateRef<any>) {
        if (template) {
            this.footerTemplate = template;
        }
    }

    /**
     * @hidden
     */
    @DeprecateProperty(`Setting combo item template with '#itemTemplate' is deprecated.\n` +
        `Use \`igxComboItem\` directive instead.`)
    @ContentChild('itemTemplate', { read: TemplateRef })
    private set oldItemTemplate(template: TemplateRef<any>) {
        if (template) {
            this.itemTemplate = template;
        }
    }

    /**
     * @hidden
     */
    @DeprecateProperty(`Setting combo item template with '#addItemTemplate' is deprecated.\n` +
        `Use \`igxComboAddItem\` directive instead.`)
    @ContentChild('addItemTemplate', { read: TemplateRef })
    private set oldAddItemTemplate(template: TemplateRef<any>) {
        if (template) {
            this.addItemTemplate = template;
        }
    }

    /**
     * @hidden
     */
    @DeprecateProperty(`Setting combo item template with '#headerItemTemplate' is deprecated.\n` +
        `Use \`igxComboHeaderItem\` directive instead.`)
    @ContentChild('headerItemTemplate', { read: TemplateRef })
    private set oldHeaderItemTemplate(template: TemplateRef<any>) {
        if (template) {
            this.headerItemTemplate = template;
        }
    }

    /**
     * @hidden
     */
    @ViewChild('dropdownItemContainer')
    protected dropdownContainer: ElementRef = null;

    /**
     * @hidden
     */
    @ViewChildren(IgxComboItemComponent, { read: IgxComboItemComponent })
    public children: QueryList<IgxComboItemComponent> = null;

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
     * <igx-combo onOpening='handleOpening($event)'></igx-combo>
     * ```
     */
    @Output()
    public onOpening = new EventEmitter<CancelableEventArgs>();

    /**
     * Emitted after the dropdown is opened
     *
     * ```html
     * <igx-combo (onOpened)='handleOpened()'></igx-combo>
     * ```
     */
    @Output()
    public onOpened = new EventEmitter<void>();

    /**
     * Emitted before the dropdown is closed
     *
     * ```html
     * <igx-combo (onClosing)='handleClosing($event)'></igx-combo>
     * ```
     */
    @Output()
    public onClosing = new EventEmitter<CancelableEventArgs>();

    /**
     * Emitted after the dropdown is closed
     *
     * ```html
     * <igx-combo (onClosed)='handleClosed()'></igx-combo>
     * ```
     */
    @Output()
    public onClosed = new EventEmitter<void>();

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
     * Emitted when the value of the search input changes (e.g. typing, pasting, clear, etc.)
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
     * Gets/gets combo id.
     *
     * ```typescript
     * // get
     * let id = this.combo.id;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [id]='combo1'></igx-combo>
     * ```
    */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-combo-${NEXT_ID++}`;

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
    public width = '100%';

    /**
     * @hidden
     */
    @HostBinding('class.igx-input-group--valid')
    public get validClass(): boolean {
        return this.valid === IgxComboState.VALID;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-input-group--invalid')
    public get invalidClass(): boolean {
        return this.valid === IgxComboState.INVALID;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-combo')
    public cssClass = 'igx-combo'; // Independant of display density, at the time being

    /**
     * @hidden
     */
    @HostBinding(`attr.role`)
    public role = 'combobox';

    /**
     * @hidden
     */
    @HostBinding('attr.aria-expanded')
    public get ariaExpanded() {
        return !this.dropdown.collapsed;
    }

    /**
     * @hidden
     */
    @HostBinding('attr.aria-haspopup')
    public get hasPopUp() {
        return 'listbox';
    }

    /**
     * @hidden
     */
    @HostBinding('attr.aria-owns')
    public get ariaOwns() {
        return this.dropdown.id;
    }

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
    public itemsMaxHeight = 480;

    /**
     * Configures the drop down list width
     *
     * ```typescript
     * // get
     * let myComboItemsWidth = this.combo.itemsWidth;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [itemsWidth] = '"180px"'></igx-combo>
     * ```
     */
    @Input()
    public itemsWidth: string;

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
    public itemHeight = 48;

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
    get data() {
        return this._data;
    }
    set data(val: any[]) {
        this._data = (val) ? val : [];
    }

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
    public valueKey: string;

    @Input()
    set displayKey(val: string) {
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
     * The item property by which items should be grouped inside the items list. Not usable if data is not of type Object[].
     *
     * ```html
     * <!--set-->
     * <igx-combo [groupKey]='newGroupKey'></igx-combo>
     * ```
     */
    @Input()
    public set groupKey(val: string) {
        this.clearSorting(this._groupKey);
        this._groupKey = val;
        this.sort(this._groupKey);
    }

    /**
     * The item property by which items should be grouped inside the items list. Not usable if data is not of type Object[].
     *
     * ```typescript
     * // get
     * let currentGroupKey = this.combo.groupKey;
     * ```
     */
    public get groupKey(): string {
        return this._groupKey;
    }

    /**
     * An @Input property that enabled/disables filtering in the list. The default is `true`.
     * ```html
     *<igx-combo [filterable]="'false'">
     * ```
     */
    @Input()
    public filterable = true;

    /**
     * An @Input property that set aria-labelledby attribute
     * ```html
     *<igx-combo [ariaLabelledBy]="'label1'">
     * ```
     */
    @Input()
    public ariaLabelledBy: string;

    /**
     * An @Input property that enabled/disables combo. The default is `false`.
     * ```html
     *<igx-combo [disabled]="'true'">
     * ```
     */
    @Input()
    public disabled = false;

    /**
     * An @Input property that sets how the combo will be styled.
     * The allowed values are `line`, `box`, `border` and `search`. The default is `box`.
     * ```html
     *<igx-combo [type]="'line'">
     * ```
     */
    @Input()
    public type = 'box';

    /**
     * Gets/Sets if control is valid, when used in a form
     *
     * ```typescript
     * // get
     * let valid = this.combo.valid;
     * ```
     * ```typescript
     * // set
     * this.combo.valid = IgxComboState.INVALID;
     * ```
    */
    public valid: IgxComboState = IgxComboState.INITIAL;

    /**
     * @hidden
     */
    public searchValue = '';

    /**
     * @hidden
     */
    public onBlur(event) {
        if (this.dropdown.collapsed) {
            this.valid = IgxComboState.INITIAL;
            if (this.ngControl) {
                if (!this.ngControl.valid) {
                    this.valid = IgxComboState.INVALID;
                }
            } else if (this._hasValidators() && !this.elementRef.nativeElement.checkValidity()) {
                this.valid = IgxComboState.INVALID;
            }
        }
    }

    private _hasValidators(): boolean {
        if (this.elementRef.nativeElement.hasAttribute('required')) {
            return true;
        }
        return !!this.ngControl && (!!this.ngControl.control.validator || !!this.ngControl.control.asyncValidator);
    }

    /**
     * @hidden
     */
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
    onInputClick(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        this.toggle();
    }

    /**
     * Defines the current state of the virtualized data. It contains `startIndex` and `chunkSize`
     *
     * ```typescript
     * // get
     * let state = this.combo.virtualizationState;
     * ```
    */
    get virtualizationState(): IForOfState {
        return this.dropdown.verticalScrollContainer.state;
    }
    /**
     * Sets the current state of the virtualized data.
     *
     * ```typescript
     * // set
     * this.combo.virtualizationState(state);
     * ```
     */
    set virtualizationState(state: IForOfState) {
        this.dropdown.verticalScrollContainer.state = state;
    }

    /**
     * Gets total count of the virtual data items, when using remote service.
     *
     * ```typescript
     * // get
     * let count = this.combo.totalItemCount;
     * ```
    */
    get totalItemCount() {
        return this.dropdown.verticalScrollContainer.totalItemCount;
    }
    /**
     * Sets total count of the virtual data items, when using remote service.
     *
     * ```typescript
     * // set
     * this.combo.totalItemCount(remoteService.count);
     * ```
     */
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
    public get filteringExpressions(): IFilteringExpression[] {
        return this.filterable ? this._filteringExpressions : [];
    }

    /**
     * @hidden
     */
    public set filteringExpressions(value: IFilteringExpression[]) {
        this._filteringExpressions = value;
        this.cdr.markForCheck();
    }

    /**
     * @hidden
     */
    public get sortingExpressions(): ISortingExpression[] {
        return this._sortingExpressions;
    }

    /**
     * @hidden
     */
    public set sortingExpressions(value: ISortingExpression[]) {
        this._sortingExpressions = value;
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
     * The text displayed in the combo input
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
     * @hidden
     */
    public get filteredData(): any[] {
        return this.filterable ? this._filteredData : this.data;
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
            this.dropdown.focusedItem = this.dropdown.items[0];
            this.dropdownContainer.nativeElement.focus();
        } else if (evt.key === 'Escape' || evt.key === 'Esc') {
            this.toggle();
        }
    }

    /**
     * @hidden
     */
    public handleKeyDown(evt) {
        if (evt.key === 'ArrowUp' || evt.key === 'Up') {
            evt.preventDefault();
            evt.stopPropagation();
            if (!this.dropdown.collapsed) {
                this.toggle();
            }
        }
    }

    private checkMatch() {
        this.customValueFlag = this.displayKey ?
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
        if (event !== undefined) {
            this.dropdown.verticalScrollContainer.scrollTo(0);
            this.onSearchInput.emit(event);
        }
        if (this.filterable) {
            this.filter();
        } else {
            this.checkMatch();
        }
    }

    /**
     * @hidden
     */
    public sort(fieldName: string, dir: SortingDirection = SortingDirection.Asc, ignoreCase: boolean = true,
        strategy: ISortingStrategy = DefaultSortingStrategy.instance()): void {
        if (!fieldName) {
            return;
        }
        const sortingState = cloneArray(this.sortingExpressions, true);

        this.prepare_sorting_expression(sortingState, fieldName, dir, ignoreCase, strategy);
        this.sortingExpressions = sortingState;
    }

    /**
     * @hidden
     */
    public getValueByValueKey(val: any): any {
        if (!val && val !== 0) {
            return undefined;
        }
        return this.valueKey ?
            this.data.filter((e) => e[this.valueKey] === val)[0] :
            this.data.filter((e) => e === val);
    }

    /**
     * @hidden
     */
    protected prepare_sorting_expression(state: ISortingExpression[], fieldName: string, dir: SortingDirection, ignoreCase: boolean,
        strategy: ISortingStrategy) {

        if (dir === SortingDirection.None) {
            state.splice(state.findIndex((expr) => expr.fieldName === fieldName), 1);
            return;
        }

        const expression = state.find((expr) => expr.fieldName === fieldName);

        if (!expression) {
            state.push({ fieldName, dir, ignoreCase, strategy });
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

    /**
     * @hidden
     */
    public get isRemote() {
        return this.totalItemCount > 0 &&
            this.valueKey &&
            this.dataType === DataTypes.COMPLEX;
    }

    /**
     * If the data source is remote, returns JSON.stringify(itemID)
     * @hidden
     * @internal
     */
    private _stringifyItemID(itemID: any) {
        return this.isRemote && typeof itemID === 'object' ? JSON.stringify(itemID) : itemID;
    }

    private _parseItemID(itemID) {
        return this.isRemote && typeof itemID === 'string' ? JSON.parse(itemID) : itemID;
    }

    /**
     * Returns if the specified itemID is selected
     * @hidden
     * @internal
     */
    public isItemSelected(item: any): boolean {
        return this.selection.is_item_selected(this.id, this._stringifyItemID(item));
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
        // This should always return a boolean value. If this.searchValue was '', it returns '' instead of false;
        return this.searchValue !== '' && this.customValueFlag;
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
            return;
        }
        const newValue = this.searchValue.trim();
        const addedItem = this.displayKey ? {
            [this.valueKey]: newValue,
            [this.displayKey]: newValue
        } : newValue;
        if (this.groupKey) {
            Object.assign(addedItem, { [this.groupKey]: this.defaultFallbackGroup });
        }
        const oldCollection = this.data;
        const newCollection = [...this.data];
        newCollection.push(addedItem);
        const args: IComboItemAdditionEvent = {
            oldCollection, addedItem, newCollection
        };
        this.onAddition.emit(args);
        this.data.push(addedItem);
        // If you mutate the array, no pipe is invoked and the display isn't updated;
        // if you replace the array, the pipe executes and the display is updated.
        this.data = cloneArray(this.data);
        this.selection.set_selected_item(this.id, addedItem);
        this.customValueFlag = false;
        this.searchInput.nativeElement.focus();
        this.dropdown.focusedItem = null;
        this.handleInputChange();
    }

    /**
     * @hidden;
     */
    public focusSearchInput(opening?: boolean): void {
        if (this.displaySearchInput && this.searchInput) {
            this.searchInput.nativeElement.focus();
        } else {
            if (opening) {
                this.dropdownContainer.nativeElement.focus();
            } else {
                this.comboInput.nativeElement.focus();
                this.toggle();
            }
        }
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
    protected onStatusChanged() {
        if ((this.ngControl.control.touched || this.ngControl.control.dirty) &&
            (this.ngControl.control.validator || this.ngControl.control.asyncValidator)) {
            this.valid = this.ngControl.valid ? IgxComboState.VALID : IgxComboState.INVALID;
        }
    }

    /**
     * @hidden
     */
    public filter() {
        this.prepare_filtering_expression(this.searchValue.trim(), IgxStringFilteringOperand.instance().condition('contains'),
            true, this.dataType === DataTypes.PRIMITIVE ? undefined : this.displayKey);
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        this._positionCallback = () => this.dropdown.updateScrollPosition();
        this.overlaySettings.positionStrategy = new ComboConnectedPositionStrategy(this._positionCallback);
        this.overlaySettings.positionStrategy.settings.target = this.elementRef.nativeElement;
        this.selection.set(this.id, new Set());
        this.selection.selectionEmitter.pipe(takeUntil(this.destroy$), filter(e => e.componentID === this.id)).subscribe((e) => {
            this.onSelectionChange.emit(e.selectionEvent);
            this._value = this.dataType !== DataTypes.PRIMITIVE ?
                e.selectionEvent.newSelection.map((id) => this._parseItemID(id)[this.displayKey]).join(', ') :
                e.selectionEvent.newSelection.join(', ');
            this._onChangeCallback(e.selectionEvent.newSelection);
        });
        if (this.ngControl && this.ngControl.value) {
            this.selectItems(this.ngControl.value, true);
        }
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        this.filteredData = [...this.data];

        if (this.ngControl) {
            this.ngControl.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(this.onStatusChanged.bind(this));
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.destroy$.complete();
        this.comboAPI.clear();
        this.selection.clear(this.id);
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
        // selectItems can handle Array<any>, no valueKey is needed;
        this.selectItems(value, true);
        this.cdr.markForCheck();
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
    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /**
     * @hidden
     */
    public get template(): TemplateRef<any> {
        this._dataType = this.dataType;
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

    /**
     * @hidden
     */
    public handleClearItems(event) {
        this.deselectAllItems(true, event);
        event.stopPropagation();
    }

    /**
     * A method that opens/closes the combo.
     *
     *```html
     *<button (click)="combo.toggle()>Toggle Combo</button>
     *<igx-combo #combo></igx-combo>
     *```
     */
    public toggle() {
        this.dropdown.toggle(this.overlaySettings);
    }

    /**
     * A method that opens the combo.
     *
     *```html
     *<button (click)="combo.open()>Open Combo</button>
     *<igx-combo #combo></igx-combo>
     *```
     */
    public open() {
        this.dropdown.open(this.overlaySettings);
    }

    /**
     * A method that closes the combo.
     *
     *```html
     *<button (click)="combo.close()>Close Combo</button>
     *<igx-combo #combo></igx-combo>
     *```
     */
    public close() {
        this.dropdown.close();
    }

    /**
     * Gets drop down state.
     *
     * ```typescript
     * // get
     * let state = this.combo.collapsed;
     * ```
    */
    public get collapsed() {
        return this.dropdown.collapsed;
    }

    /**
     * Get current selection state
     * @returns Array of selected items
     * ```typescript
     * // get
     * let selectedItems = this.combo.selectedItems();
     * ```
     */
    public selectedItems() {
        const items = Array.from(this.selection.get(this.id));
        return this.isRemote ? items.map(item => this._parseItemID(item)) : items;
    }

    /**
     * Select defined items
     * @param newItems new items to be selected
     * @param clearCurrentSelection if true clear previous selected items
     * ```typescript
     * // get
     * this.combo.selectItems(["New York", "New Jersey"]);
     * ```
     */
    public selectItems(newItems: Array<any>, clearCurrentSelection?: boolean) {
        if (newItems) {
            this.selection.select_items(this.id, newItems, clearCurrentSelection);
        }
    }

    /**
     * Deselect defined items
     * @param items items to deselected
     * ```typescript
     * // get
     * this.combo.deselectItems(["New York", "New Jersey"]);
     * ```
     */
    public deselectItems(items: Array<any>) {
        if (items) {
            this.selection.deselect_items(this.id, items);
        }
    }

    /**
     * Select all (filtered) items
     * @param ignoreFilter if set to true, selects all items, otherwise selects only the filtered ones.
     * ```typescript
     * // get
     * this.combo.selectAllItems();
     * ```
     */
    public selectAllItems(ignoreFilter?: boolean, event?: Event) {
        const allVisible = this.selection.get_all_ids(ignoreFilter ? this.data : this.filteredData);
        const newSelection = this.selection.add_items(this.id, allVisible);
        this.selection.set(this.id, newSelection, event);
    }

    /**
     * Deselect all (filtered) items
     * @param ignoreFilter if set to true, deselects all items, otherwise deselects only the filtered ones.
     * ```typescript
     * // get
     * this.combo.deselectAllItems();
     * ```
     */
    public deselectAllItems(ignoreFilter?: boolean, event?: Event) {
        if (this.filteredData.length === this.data.length || ignoreFilter) {
            this.selection.set(this.id, this.selection.get_empty(), event);
        } else {
            const newSelection = this.selection.delete_items(this.id, this.selection.get_all_ids(this.filteredData));
            this.selection.set(this.id, newSelection, event);
        }
    }
    /**
     * Event handlers
     * @hidden
     * @internal
     */
    handleOpening(event: CancelableEventArgs) {
        this.onOpening.emit(event);
        if (event.cancel) {
            return;
        }
        this.handleInputChange();
    }

    /**
     * @hidden
     */
    handleOpened() {
        this.triggerCheck();
        this.focusSearchInput(true);
        this.onOpened.emit();
    }

    /**
     * @hidden
     */
    handleClosing(event) {
        this.onClosing.emit(event);
        if (event.cancel) {
            return;
        }
        this.searchValue = '';
    }

    /**
     * @hidden
     */
    handleClosed() {
        this.comboInput.nativeElement.focus();
        this.onClosed.emit();
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxComboComponent, IgxComboItemComponent, IgxComboFilterConditionPipe, IgxComboGroupingPipe,
        IgxComboFilteringPipe, IgxComboSortingPipe, IgxComboDropDownComponent, IgxComboAddItemComponent,
        IgxComboItemDirective,
        IgxComboEmptyDirective,
        IgxComboHeaderItemDirective,
        IgxComboHeaderDirective,
        IgxComboFooterDirective,
        IgxComboAddItemDirective],
    exports: [IgxComboComponent, IgxComboItemComponent, IgxComboDropDownComponent, IgxComboAddItemComponent,
        IgxComboItemDirective,
        IgxComboEmptyDirective,
        IgxComboHeaderItemDirective,
        IgxComboHeaderDirective,
        IgxComboFooterDirective,
        IgxComboAddItemDirective],
    imports: [IgxRippleModule, CommonModule, IgxInputGroupModule, FormsModule, ReactiveFormsModule,
        IgxForOfModule, IgxToggleModule, IgxCheckboxModule, IgxDropDownModule, IgxButtonModule, IgxIconModule],
    providers: [IgxSelectionAPIService]
})
export class IgxComboModule { }
