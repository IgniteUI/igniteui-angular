import {
    AfterContentChecked,
    AfterViewChecked,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectorRef,
    ContentChild,
    ContentChildren,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    Inject,
    InjectionToken,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl } from '@angular/forms';
import { caseSensitive } from '@igniteui/material-icons-extended';
import { noop, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxSelectionAPIService } from '../core/selection';
import { CancelableBrowserEventArgs, cloneArray, IBaseCancelableBrowserEventArgs, IBaseEventArgs, rem } from '../core/utils';
import { SortingDirection } from '../data-operations/sorting-strategy';
import { IForOfState, IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { IgxIconService } from '../icon/icon.service';
import { IgxInputGroupType, IGX_INPUT_GROUP_TYPE } from '../input-group/inputGroupType';
import { IgxInputDirective, IgxInputGroupComponent, IgxInputState, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective } from '../input-group/public_api';
import { AbsoluteScrollStrategy, AutoPositionStrategy, OverlaySettings } from '../services/public_api';
import { IgxComboDropDownComponent } from './combo-dropdown.component';
import { IgxComboAPIService } from './combo.api';
import {
    IgxComboAddItemDirective, IgxComboClearIconDirective, IgxComboEmptyDirective,
    IgxComboFooterDirective, IgxComboHeaderDirective, IgxComboHeaderItemDirective, IgxComboItemDirective, IgxComboToggleIconDirective
} from './combo.directives';
import { IComboItemAdditionEvent, IComboSearchInputEventArgs } from './public_api';
import { ComboResourceStringsEN, IComboResourceStrings } from '../core/i18n/combo-resources';
import { getCurrentResourceStrings } from '../core/i18n/resources';
import { DOCUMENT } from '@angular/common';
import { isEqual } from 'lodash-es';

export const IGX_COMBO_COMPONENT = /*@__PURE__*/new InjectionToken<IgxComboBase>('IgxComboComponentToken');

/** @hidden @internal TODO: Evaluate */
export interface IgxComboBase {
    id: string;
    data: any[] | null;
    valueKey: string;
    groupKey: string;
    isRemote: boolean;
    filteredData: any[] | null;
    totalItemCount: number;
    itemsMaxHeight: number;
    itemHeight: number;
    searchValue: string;
    searchInput: ElementRef<HTMLInputElement>;
    comboInput: ElementRef<HTMLInputElement>;
    opened: EventEmitter<IBaseEventArgs>;
    opening: EventEmitter<CancelableBrowserEventArgs>;
    closing: EventEmitter<CancelableBrowserEventArgs>;
    closed: EventEmitter<IBaseEventArgs>;
    focusSearchInput(opening?: boolean): void;
    triggerCheck(): void;
    addItemToCollection(): void;
    isAddButtonVisible(): boolean;
    handleInputChange(event?: string): void;
    isItemSelected(itemID: any): boolean;
    select(item: any): void;
    select(itemIDs: any[], clearSelection?: boolean, event?: Event): void;
    deselect(...args: [] | [itemIDs: any[], event?: Event]): void;
    setActiveDescendant(): void;
}

let NEXT_ID = 0;


/** @hidden @internal */
export const enum DataTypes {
    EMPTY = 'empty',
    PRIMITIVE = 'primitive',
    COMPLEX = 'complex',
    PRIMARYKEY = 'valueKey'
}

/** The filtering criteria to be applied on data search */
export interface IComboFilteringOptions {
    /** Defines filtering case-sensitivity */
    caseSensitive?: boolean;
    /**
     * Defines whether filtering is allowed
     * @deprecated in version 18.2.0. Use the `disableFiltering` property instead.
    */
    filterable?: boolean;
    /** Defines optional key to filter against complex list items. Default to displayKey if provided.*/
    filteringKey?: string;
}

@Directive()
export abstract class IgxComboBaseDirective implements IgxComboBase, AfterViewChecked, OnInit,
    AfterViewInit, AfterContentChecked, OnDestroy, ControlValueAccessor {
    /**
     * Defines whether the caseSensitive icon should be shown in the search input
     *
     * ```typescript
     * // get
     * let myComboShowSearchCaseIcon = this.combo.showSearchCaseIcon;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [showSearchCaseIcon]='true'></igx-combo>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public showSearchCaseIcon = false;

    /**
     * Set custom overlay settings that control how the combo's list of items is displayed.
     * Set:
     * ```html
     * <igx-combo [overlaySettings]="customOverlaySettings"></igx-combo>
     * ```
     *
     * ```typescript
     *  const customSettings = { positionStrategy: { settings: { target: myTarget } } };
     *  combo.overlaySettings = customSettings;
     * ```
     * Get any custom overlay settings used by the combo:
     * ```typescript
     *  const comboOverlaySettings: OverlaySettings = myCombo.overlaySettings;
     * ```
     */
    @Input()
    public overlaySettings: OverlaySettings = null;

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
    public get id(): string {
        return this._id;
    }

    public set id(value: string) {
        if (!value) {
            return;
        }
        const selection = this.selectionService.get(this._id);
        this.selectionService.clear(this._id);
        this._id = value;
        if (selection) {
            this.selectionService.set(this._id, selection);
        }
    }

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
    public width: string;

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
    @Input({ transform: booleanAttribute })
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
    public get itemsMaxHeight(): number {
        if (this.itemHeight && !this._itemsMaxHeight) {
            return this.itemHeight * this.itemsInContainer;
        }
        return this._itemsMaxHeight;
    }

    public set itemsMaxHeight(val: number) {
        this._itemsMaxHeight = val;
    }

    /** @hidden */
    public get itemsMaxHeightInRem() {
        if (this.itemsMaxHeight) {
            return rem(this.itemsMaxHeight);
        }
    }

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
    public get itemHeight(): number {
        return this._itemHeight;
    }

    public set itemHeight(val: number) {
        this._itemHeight = val;
    }

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
    public placeholder: string;

    /**
     * Combo data source.
     *
     * ```html
     * <!--set-->
     * <igx-combo [data]='items'></igx-combo>
     * ```
     */
    @Input()
    public get data(): any[] | null {
        return this._data;
    }
    public set data(val: any[] | null) {
        // igxFor directive ignores undefined values
        // if the combo uses simple data and filtering is applied
        // an error will occur due to the mismatch of the length of the data
        // this can occur during filtering for the igx-combo and
        // during filtering & selection for the igx-simple-combo
        // since the simple combo's input is both a container for the selection and a filter
        this._data = (val) ? val.filter(x => x !== undefined) : [];
    }

    /**
     * Determines which column in the data source is used to determine the value.
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
    public valueKey: string = null;

    @Input()
    public set displayKey(val: string) {
        this._displayKey = val;
    }

    /**
     * Determines which column in the data source is used to determine the display value.
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
     * <igx-combo [displayKey]='myDisplayKey'></igx-combo>
     * ```
     */
    public get displayKey() {
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
        this._groupKey = val;
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
     * Sets groups sorting order.
     *
     * @example
     * ```html
     * <igx-combo [groupSortingDirection]="groupSortingDirection"></igx-combo>
     * ```
     * ```typescript
     * public groupSortingDirection = SortingDirection.Asc;
     * ```
     */
    @Input()
    public get groupSortingDirection(): SortingDirection {
        return this._groupSortingDirection;
    }
    public set groupSortingDirection(val: SortingDirection) {
        this._groupSortingDirection = val;
    }

    /**
     * Gets/Sets the custom filtering function of the combo.
     *
     * @example
     * ```html
     *  <igx-comb #combo [data]="localData" [filterFunction]="filterFunction"></igx-combo>
     * ```
     */
    @Input()
    public filterFunction: (collection: any[], searchValue: any, filteringOptions: IComboFilteringOptions) => any[];

    /**
     * Sets aria-labelledby attribute value.
     * ```html
     * <igx-combo [ariaLabelledBy]="'label1'">
     * ```
     */
    @Input()
    public ariaLabelledBy: string;

    /** @hidden @internal */
    @HostBinding('class.igx-combo')
    public cssClass = 'igx-combo'; // Independent of display density for the time being

    /**
     * Disables the combo. The default is `false`.
     * ```html
     * <igx-combo [disabled]="'true'">
     * ```
     */
    @Input({ transform: booleanAttribute })
    public disabled = false;

    /**
     * Sets the visual combo type.
     * The allowed values are `line`, `box`, `border` and `search`. The default is `box`.
     * ```html
     * <igx-combo [type]="'line'">
     * ```
     */
    @Input()
    public get type(): IgxInputGroupType {
        return this._type || this._inputGroupType || 'box';
    }

    public set type(val: IgxInputGroupType) {
        this._type = val;
    }

    /**
     * Gets/Sets the resource strings.
     *
     * @remarks
     * By default it uses EN resources.
     */
    @Input()
    public get resourceStrings(): IComboResourceStrings {
        return this._resourceStrings;
    }
    public set resourceStrings(value: IComboResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * Emitted before the dropdown is opened
     *
     * ```html
     * <igx-combo opening='handleOpening($event)'></igx-combo>
     * ```
     */
    @Output()
    public opening = new EventEmitter<IBaseCancelableBrowserEventArgs>();

    /**
     * Emitted after the dropdown is opened
     *
     * ```html
     * <igx-combo (opened)='handleOpened($event)'></igx-combo>
     * ```
     */
    @Output()
    public opened = new EventEmitter<IBaseEventArgs>();

    /**
     * Emitted before the dropdown is closed
     *
     * ```html
     * <igx-combo (closing)='handleClosing($event)'></igx-combo>
     * ```
     */
    @Output()
    public closing = new EventEmitter<IBaseCancelableBrowserEventArgs>();

    /**
     * Emitted after the dropdown is closed
     *
     * ```html
     * <igx-combo (closed)='handleClosed($event)'></igx-combo>
     * ```
     */
    @Output()
    public closed = new EventEmitter<IBaseEventArgs>();

    /**
     * Emitted when an item is being added to the data collection
     *
     * ```html
     * <igx-combo (addition)='handleAdditionEvent($event)'></igx-combo>
     * ```
     */
    @Output()
    public addition = new EventEmitter<IComboItemAdditionEvent>();

    /**
     * Emitted when the value of the search input changes (e.g. typing, pasting, clear, etc.)
     *
     * ```html
     * <igx-combo (searchInputUpdate)='handleSearchInputEvent($event)'></igx-combo>
     * ```
     */
    @Output()
    public searchInputUpdate = new EventEmitter<IComboSearchInputEventArgs>();

    /**
     * Emitted when new chunk of data is loaded from the virtualization
     *
     * ```html
     * <igx-combo (dataPreLoad)='handleDataPreloadEvent($event)'></igx-combo>
     * ```
     */
    @Output()
    public dataPreLoad = new EventEmitter<IForOfState>();

    /**
     * The custom template, if any, that should be used when rendering ITEMS in the combo list
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.itemTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboItem let-item let-key="valueKey">
     *          <div class="custom-item">
     *              <div class="custom-item__name">{{ item[key] }}</div>
     *              <div class="custom-item__cost">{{ item.cost }}</div>
     *          </div>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboItemDirective, { read: TemplateRef })
    public itemTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the HEADER for the combo items list
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.headerTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboHeader>
     *          <div class="combo__header">
     *              This is a custom header
     *          </div>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboHeaderDirective, { read: TemplateRef })
    public headerTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the FOOTER for the combo items list
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.footerTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboFooter>
     *          <div class="combo__footer">
     *              This is a custom footer
     *          </div>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboFooterDirective, { read: TemplateRef })
    public footerTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering HEADER ITEMS for groups in the combo list
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.headerItemTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboHeaderItem let-item let-key="groupKey">
     *          <div class="custom-item--group">Group header for {{ item[key] }}</div>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboHeaderItemDirective, { read: TemplateRef })
    public headerItemTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the ADD BUTTON in the combo drop down
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.addItemTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboAddItem>
     *          <button type="button" igxButton="contained" class="combo__add-button">
     *              Click to add item
     *          </button>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboAddItemDirective, { read: TemplateRef })
    public addItemTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the ADD BUTTON in the combo drop down
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.emptyTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboEmpty>
     *          <div class="combo--empty">
     *              There are no items to display
     *          </div>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboEmptyDirective, { read: TemplateRef })
    public emptyTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the combo TOGGLE(open/close) button
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.toggleIconTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboToggleIcon let-collapsed>
     *          <igx-icon>{{ collapsed ? 'remove_circle' : 'remove_circle_outline'}}</igx-icon>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboToggleIconDirective, { read: TemplateRef })
    public toggleIconTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the combo CLEAR button
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.combo.clearIconTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-combo #combo>
     *      ...
     *      <ng-template igxComboClearIcon>
     *          <igx-icon>clear</igx-icon>
     *      </ng-template>
     *  </igx-combo>
     * ```
     */
    @ContentChild(IgxComboClearIconDirective, { read: TemplateRef })
    public clearIconTemplate: TemplateRef<any> = null;

    /** @hidden @internal */
    @ContentChild(forwardRef(() => IgxLabelDirective), { static: true }) public label: IgxLabelDirective;

    /** @hidden @internal */
    @ViewChild('inputGroup', { read: IgxInputGroupComponent, static: true })
    public inputGroup: IgxInputGroupComponent;

    /** @hidden @internal */
    @ViewChild('comboInput', { read: IgxInputDirective, static: true })
    public comboInput: IgxInputDirective;

    /** @hidden @internal */
    @ViewChild('searchInput')
    public searchInput: ElementRef<HTMLInputElement> = null;

    /** @hidden @internal */
    @ViewChild(IgxForOfDirective, { static: true })
    public virtualScrollContainer: IgxForOfDirective<any>;

    @ViewChild(IgxForOfDirective, { read: IgxForOfDirective, static: true })
    protected virtDir: IgxForOfDirective<any>;

    @ViewChild('dropdownItemContainer', { static: true })
    protected dropdownContainer: ElementRef = null;

    @ViewChild('primitive', { read: TemplateRef, static: true })
    protected primitiveTemplate: TemplateRef<any>;

    @ViewChild('complex', { read: TemplateRef, static: true })
    protected complexTemplate: TemplateRef<any>;

    @ContentChildren(IgxPrefixDirective, { descendants: true })
    protected prefixes: QueryList<IgxPrefixDirective>;

    @ContentChildren(IgxSuffixDirective, { descendants: true })
    protected suffixes: QueryList<IgxSuffixDirective>;

    /** @hidden @internal */
    public get searchValue(): string {
        return this._searchValue;
    }
    public set searchValue(val: string) {
        this.filterValue = val;
        this._searchValue = val;
    }

    /** @hidden @internal */
    public get isRemote() {
        return this.totalItemCount > 0 &&
            this.valueKey &&
            this.dataType === DataTypes.COMPLEX;
    }

    /** @hidden @internal */
    public get dataType(): string {
        if (this.displayKey) {
            return DataTypes.COMPLEX;
        }
        return DataTypes.PRIMITIVE;
    }

    /**
     * Gets if control is valid, when used in a form
     *
     * ```typescript
     * // get
     * let valid = this.combo.valid;
     * ```
     */
    public get valid(): IgxInputState {
        return this._valid;
    }

    /**
     * Sets if control is valid, when used in a form
     *
     * ```typescript
     * // set
     * this.combo.valid = IgxInputState.INVALID;
     * ```
     */
    public set valid(valid: IgxInputState) {
        this._valid = valid;
        this.comboInput.valid = valid;
    }

    /**
     * The value of the combo
     *
     * ```typescript
     * // get
     * let comboValue = this.combo.value;
     * ```
     */
    public get value(): any[] {
        return this._value;
    }

    /**
     * The text displayed in the combo input
     *
     * ```typescript
     * // get
     * let comboDisplayValue = this.combo.displayValue;
     * ```
     */
    public get displayValue(): string {
        return this._displayValue;
    }

    /**
     * Defines the current state of the virtualized data. It contains `startIndex` and `chunkSize`
     *
     * ```typescript
     * // get
     * let state = this.combo.virtualizationState;
     * ```
     */
    public get virtualizationState(): IForOfState {
        return this.virtDir.state;
    }
    /**
     * Sets the current state of the virtualized data.
     *
     * ```typescript
     * // set
     * this.combo.virtualizationState(state);
     * ```
     */
    public set virtualizationState(state: IForOfState) {
        this.virtDir.state = state;
    }

    /**
     * Gets drop down state.
     *
     * ```typescript
     * let state = this.combo.collapsed;
     * ```
     */
    public get collapsed(): boolean {
        return this.dropdown.collapsed;
    }

    /**
     * Gets total count of the virtual data items, when using remote service.
     *
     * ```typescript
     * // get
     * let count = this.combo.totalItemCount;
     * ```
     */
    public get totalItemCount(): number {
        return this.virtDir.totalItemCount;
    }
    /**
     * Sets total count of the virtual data items, when using remote service.
     *
     * ```typescript
     * // set
     * this.combo.totalItemCount(remoteService.count);
     * ```
     */
    public set totalItemCount(count: number) {
        this.virtDir.totalItemCount = count;
    }

    /** @hidden @internal */
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

    /** @hidden @internal */
    public customValueFlag = true;
    /** @hidden @internal */
    public filterValue = '';
    /** @hidden @internal */
    public defaultFallbackGroup = 'Other';
    /** @hidden @internal */
    public activeDescendant = '';

    /**
     * Configures the way combo items will be filtered.
     *
     * ```typescript
     * // get
     * let myFilteringOptions = this.combo.filteringOptions;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [filteringOptions]='myFilteringOptions'></igx-combo>
     * ```
     */

    @Input()
    public get filteringOptions(): IComboFilteringOptions {
        return this._filteringOptions || this._defaultFilteringOptions;
    }
    public set filteringOptions(value: IComboFilteringOptions) {
        this._filteringOptions = value;
    }

    protected containerSize = undefined;
    protected itemSize = undefined;
    protected _data = [];
    protected _value = [];
    protected _displayValue = '';
    protected _groupKey = '';
    protected _searchValue = '';
    protected _filteredData = [];
    protected _displayKey: string;
    protected _remoteSelection = {};
    protected _resourceStrings = getCurrentResourceStrings(ComboResourceStringsEN);
    protected _valid = IgxInputState.INITIAL;
    protected ngControl: NgControl = null;
    protected destroy$ = new Subject<void>();
    protected _onTouchedCallback: () => void = noop;
    protected _onChangeCallback: (_: any) => void = noop;
    protected compareCollator = new Intl.Collator();
    protected computedStyles;

    private _id: string = `igx-combo-${NEXT_ID++}`;
    private _type = null;
    private _dataType = '';
    private _itemHeight = undefined;
    private _itemsMaxHeight = null;
    private _overlaySettings: OverlaySettings;
    private _groupSortingDirection: SortingDirection = SortingDirection.Asc;
    private _filteringOptions: IComboFilteringOptions;
    private _defaultFilteringOptions: IComboFilteringOptions = { caseSensitive: false };
    private itemsInContainer = 10;

    public abstract dropdown: IgxComboDropDownComponent;
    public abstract selectionChanging: EventEmitter<any>;

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selectionService: IgxSelectionAPIService,
        protected comboAPI: IgxComboAPIService,
        @Inject(DOCUMENT) public document: Document,
        @Optional() @Inject(IGX_INPUT_GROUP_TYPE) protected _inputGroupType: IgxInputGroupType,
        @Optional() protected _injector: Injector,
        @Optional() @Inject(IgxIconService) protected _iconService?: IgxIconService,
    ) { }

    public ngAfterViewChecked() {
        const targetElement = this.inputGroup.element.nativeElement.querySelector('.igx-input-group__bundle') as HTMLElement;

        this._overlaySettings = {
            target: targetElement,
            scrollStrategy: new AbsoluteScrollStrategy(),
            positionStrategy: new AutoPositionStrategy(),
            modal: false,
            closeOnOutsideClick: true,
            excludeFromOutsideClick: [targetElement]
        };
    }

    /** @hidden @internal */
    public ngAfterContentChecked(): void {
        if (this.inputGroup && this.prefixes?.length > 0) {
            this.inputGroup.prefixes = this.prefixes;
        }

        if (this.inputGroup && this.suffixes?.length > 0) {
            this.inputGroup.suffixes = this.suffixes;
        }
    }

    /** @hidden @internal */
    public ngOnInit() {

        this.ngControl = this._injector.get<NgControl>(NgControl, null);
        this.selectionService.set(this.id, new Set());
        this._iconService?.addSvgIconFromText(caseSensitive.name, caseSensitive.value, 'imx-icons');
        this.computedStyles = this.document.defaultView.getComputedStyle(this.elementRef.nativeElement);
    }

    /** @hidden @internal */
    public ngAfterViewInit(): void {
        this.filteredData = [...this.data];
        if (this.ngControl) {
            this.ngControl.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(this.onStatusChanged);
            this.manageRequiredAsterisk();
            this.cdr.detectChanges();
        }
        this.virtDir.chunkPreload.pipe(takeUntil(this.destroy$)).subscribe((e: IForOfState) => {
            const eventArgs: IForOfState = Object.assign({}, e, { owner: this });
            this.dataPreLoad.emit(eventArgs);
        });
        this.dropdown?.opening.subscribe((_args: IBaseCancelableBrowserEventArgs) => {
            // calculate the container size and item size based on the sizes from the DOM
            const dropdownContainerHeight = this.dropdownContainer.nativeElement.getBoundingClientRect().height;
            if (dropdownContainerHeight) {
                this.containerSize = parseFloat(dropdownContainerHeight);
            }
            if (this.dropdown.children?.first) {
                this.itemSize = this.dropdown.children.first.element.nativeElement.getBoundingClientRect().height;
            }
        });
    }

    /** @hidden @internal */
    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.comboAPI.clear();
        this.selectionService.delete(this.id);
    }

    /**
     * A method that opens/closes the combo.
     *
     * ```html
     * <button type="button" (click)="combo.toggle()">Toggle Combo</button>
     * <igx-combo #combo></igx-combo>
     * ```
     */
    public toggle(): void {
        if (this.collapsed && this._displayValue.length !== 0) {
            this.filterValue = '';
            this.cdr.detectChanges();
        }
        const overlaySettings = Object.assign({}, this._overlaySettings, this.overlaySettings);
        this.dropdown.toggle(overlaySettings);
        if (!this.collapsed) {
            this.setActiveDescendant();
        }
    }

    /**
     * A method that opens the combo.
     *
     * ```html
     * <button type="button" (click)="combo.open()">Open Combo</button>
     * <igx-combo #combo></igx-combo>
     * ```
     */
    public open(): void {
        if (this.collapsed && this._displayValue.length !== 0) {
            this.filterValue = '';
            this.cdr.detectChanges();
        }
        const overlaySettings = Object.assign({}, this._overlaySettings, this.overlaySettings);
        this.dropdown.open(overlaySettings);
        this.setActiveDescendant();
    }

    /**
     * A method that closes the combo.
     *
     * ```html
     * <button type="button" (click)="combo.close()">Close Combo</button>
     * <igx-combo #combo></igx-combo>
     * ```
     */
    public close(): void {
        this.dropdown.close();
    }

    /**
     * Triggers change detection on the combo view
     */
    public triggerCheck() {
        this.cdr.detectChanges();
    }

    /**
     * Get current selection state
     *
     * @returns Array of selected items
     * ```typescript
     * let mySelection = this.combo.selection;
     * ```
     */
    public get selection(): any[] {
        const items = Array.from(this.selectionService.get(this.id));
        return this.convertKeysToItems(items);
    }

    /**
     * Returns if the specified itemID is selected
     *
     * @hidden
     * @internal
     */
    public isItemSelected(item: any): boolean {
        return this.selectionService.is_item_selected(this.id, item);
    }

    /** @hidden @internal */
    public get toggleIcon(): string {
        return this.dropdown.collapsed ? 'input_expand' : 'input_collapse';
    }

    /** @hidden @internal */
    public addItemToCollection() {
        if (!this.searchValue) {
            return;
        }
        const addedItem = this.displayKey ? {
            [this.valueKey]: this.searchValue,
            [this.displayKey]: this.searchValue
        } : this.searchValue;
        if (this.groupKey) {
            Object.assign(addedItem, { [this.groupKey]: this.defaultFallbackGroup });
        }
        // expose shallow copy instead of this.data in event args so this.data can't be mutated
        const oldCollection = [...this.data];
        const newCollection = [...this.data, addedItem];
        const args: IComboItemAdditionEvent = {
            oldCollection, addedItem, newCollection, owner: this, cancel: false
        };
        this.addition.emit(args);
        if (args.cancel) {
            return;
        }
        this.data.push(args.addedItem);
        // trigger re-render
        this.data = cloneArray(this.data);
        this.select(this.valueKey !== null && this.valueKey !== undefined ?
            [args.addedItem[this.valueKey]] : [args.addedItem], false);
        this.customValueFlag = false;
        this.searchInput?.nativeElement.focus();
        this.dropdown.focusedItem = null;
        this.virtDir.scrollTo(0);
    }

    /** @hidden @internal */
    public isAddButtonVisible(): boolean {
        // This should always return a boolean value. If this.searchValue was '', it returns '' instead of false;
        return this.searchValue !== '' && this.customValueFlag;
    }

    /** @hidden @internal */
    public handleInputChange(event?: any) {
        if (event !== undefined) {
            const args: IComboSearchInputEventArgs = {
                searchText: typeof event === 'string' ? event : event.target.value,
                owner: this,
                cancel: false
            };
            this.searchInputUpdate.emit(args);
            if (args.cancel) {
                this.filterValue = null;
            }
        }
        this.checkMatch();
    }

    /**
     * Event handlers
     *
     * @hidden
     * @internal
     */
    public handleOpening(e: IBaseCancelableBrowserEventArgs) {
        const args: IBaseCancelableBrowserEventArgs = { owner: this, event: e.event, cancel: e.cancel };
        this.opening.emit(args);
        e.cancel = args.cancel;
    }

    /** @hidden @internal */
    public handleClosing(e: IBaseCancelableBrowserEventArgs) {
        const args: IBaseCancelableBrowserEventArgs = { owner: this, event: e.event, cancel: e.cancel };
        this.closing.emit(args);
        e.cancel = args.cancel;
        if (e.cancel) {
            return;
        }
        this.searchValue = '';
        if (!e.event) {
            this.comboInput?.nativeElement.focus();
        } else {
            this._onTouchedCallback();
            this.updateValidity();
        }
    }

    /** @hidden @internal */
    public handleClosed() {
        this.closed.emit({ owner: this });
    }

    /** @hidden @internal */
    public handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'ArrowUp' || event.key === 'Up') {
            event.preventDefault();
            event.stopPropagation();
            this.close();
        }
    }

    /** @hidden @internal */
    public registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    /** @hidden @internal */
    public registerOnTouched(fn: any): void {
        this._onTouchedCallback = fn;
    }

    /** @hidden @internal */
    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /** @hidden @internal */
    public onClick(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        if (!this.disabled) {
            this.toggle();
        }
    }

    /** @hidden @internal */
    public onBlur() {
        if (this.collapsed) {
            this._onTouchedCallback();
            this.updateValidity();
        }
    }

    /** @hidden @internal */
    public setActiveDescendant(): void {
        this.activeDescendant = this.dropdown.focusedItem?.id || '';
    }

    /** @hidden @internal */
    public toggleCaseSensitive() {
        this.filteringOptions = Object.assign({}, this.filteringOptions, { caseSensitive: !this.filteringOptions.caseSensitive });
    }

    protected onStatusChanged = () => {
        if (this.ngControl && this.isTouchedOrDirty && !this.disabled) {
            if (this.hasValidators && (!this.collapsed || this.inputGroup.isFocused)) {
                this.valid = this.ngControl.valid ? IgxInputState.VALID : IgxInputState.INVALID;
            } else {
                this.valid = this.ngControl.valid ? IgxInputState.INITIAL : IgxInputState.INVALID;
            }
        } else {
            // B.P. 18 May 2021: IgxDatePicker does not reset its state upon resetForm #9526
            this.valid = IgxInputState.INITIAL;
        }
        this.manageRequiredAsterisk();
    };

    private updateValidity() {
        if (this.ngControl && this.ngControl.invalid) {
            this.valid = IgxInputState.INVALID;
        } else {
            this.valid = IgxInputState.INITIAL;
        }
    }

    private get isTouchedOrDirty(): boolean {
        return (this.ngControl.control.touched || this.ngControl.control.dirty);
    }

    private get hasValidators(): boolean {
        return (!!this.ngControl.control.validator || !!this.ngControl.control.asyncValidator);
    }

    /** if there is a valueKey - map the keys to data items, else - just return the keys */
    protected convertKeysToItems(keys: any[]) {
        if (this.valueKey === null || this.valueKey === undefined) {
            return keys;
        }

        return keys.map(key => {
            const item = this.data.find(entry => isEqual(entry[this.valueKey], key));

            return item !== undefined ? item : { [this.valueKey]: key };
        });
    }

    protected checkMatch(): void {
        const itemMatch = this.filteredData.some(this.findMatch);
        this.customValueFlag = this.allowCustomValues && !itemMatch;
    }

    protected findMatch = (element: any): boolean => {
        const value = this.displayKey ? element[this.displayKey] : element;
        const searchValue = this.searchValue || this.comboInput?.value;
        return value?.toString().trim().toLowerCase() === searchValue.trim().toLowerCase();
    };

    protected manageRequiredAsterisk(): void {
        if (this.ngControl) {
            this.inputGroup.isRequired = this.required;
        }
    }

    /** Contains key-value pairs of the selected valueKeys and their resp. displayKeys */
    protected registerRemoteEntries(ids: any[], add = true) {
        if (add) {
            const selection = this.getValueDisplayPairs(ids);
            for (const entry of selection) {
                this._remoteSelection[entry[this.valueKey]] = entry[this.displayKey];
            }
        } else {
            for (const entry of ids) {
                delete this._remoteSelection[entry];
            }
        }
    }

    /**
     * For `id: any[]` returns a mapped `{ [combo.valueKey]: any, [combo.displayKey]: any }[]`
     */
    protected getValueDisplayPairs(ids: any[]) {
        return this.data.filter(entry => ids.indexOf(entry[this.valueKey]) > -1).map(e => ({
            [this.valueKey]: e[this.valueKey],
            [this.displayKey]: e[this.displayKey]
        }));
    }

    protected getRemoteSelection(newSelection: any[], oldSelection: any[]): string {
        if (!newSelection.length) {
            // If new selection is empty, clear all items
            this.registerRemoteEntries(oldSelection, false);
            return '';
        }
        const removedItems = oldSelection.filter(e => newSelection.indexOf(e) < 0);
        const addedItems = newSelection.filter(e => oldSelection.indexOf(e) < 0);
        this.registerRemoteEntries(addedItems);
        this.registerRemoteEntries(removedItems, false);
        return Object.keys(this._remoteSelection).map(e => this._remoteSelection[e]).join(', ');
    }

    protected get required(): boolean {
        if (this.ngControl && this.ngControl.control && this.ngControl.control.validator) {
            // Run the validation with empty object to check if required is enabled.
            const error = this.ngControl.control.validator({} as AbstractControl);
            return error && error.required;
        }

        return false;
    }

    public abstract get filteredData(): any[] | null;
    public abstract set filteredData(val: any[] | null);

    public abstract handleOpened();
    public abstract onArrowDown(event: Event);
    public abstract focusSearchInput(opening?: boolean);

    public abstract select(newItem: any): void;
    public abstract select(newItems: Array<any> | any, clearCurrentSelection?: boolean, event?: Event): void;

    public abstract deselect(...args: [] | [items: Array<any>, event?: Event]): void;

    public abstract writeValue(value: any): void;

    protected abstract setSelection(newSelection: Set<any>, event?: Event): void;
    protected abstract createDisplayText(newSelection: any[], oldSelection: any[]);
}
