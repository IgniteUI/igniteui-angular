import {
    AfterContentChecked,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectorRef,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    InjectionToken,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    DOCUMENT,
    inject,
    signal,
    computed,
    ViewChild,
    viewChild,
    contentChild,
    contentChildren,
    viewChildren,
    linkedSignal
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl } from '@angular/forms';
import { caseSensitive } from '@igniteui/material-icons-extended';
import { noop, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    IgxSelectionAPIService,
    SortingDirection,
    CancelableBrowserEventArgs,
    cloneArray,
    IBaseCancelableBrowserEventArgs,
    IBaseEventArgs,
    rem,
    AbsoluteScrollStrategy,
    AutoPositionStrategy,
    OverlaySettings,
    ComboResourceStringsEN,
    IComboResourceStrings,
    getCurrentResourceStrings,
    onResourceChangeHandle
} from 'igniteui-angular/core';
import { IForOfState, IgxForOfDirective } from 'igniteui-angular/directives';
import { IgxIconService } from 'igniteui-angular/icon';
import { IGX_INPUT_GROUP_TYPE, IgxInputDirective, IgxInputGroupComponent, IgxInputGroupType, IgxInputState, IgxHintDirective, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective } from 'igniteui-angular/input-group';
import { IgxComboDropDownComponent } from './combo-dropdown.component';
import { IgxComboAPIService } from './combo.api';
import {
    IgxComboAddItemDirective, IgxComboClearIconDirective, IgxComboEmptyDirective,
    IgxComboFooterDirective, IgxComboHeaderDirective, IgxComboHeaderItemDirective, IgxComboItemDirective, IgxComboToggleIconDirective
} from './combo.directives';
import { isEqual } from 'lodash-es';
import { IComboItemAdditionEvent, IComboSearchInputEventArgs } from './combo.component';

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
    /** Defines optional key to filter against complex list items. Default to displayKey if provided.*/
    filteringKey?: string;
}

@Directive({
    host: {
        '[attr.id]': 'id',
        '[style.width]': 'width',
        '[class.igx-combo]': 'cssClass'
    }
})
export abstract class IgxComboBaseDirective implements IgxComboBase, OnInit,
    AfterViewInit, AfterContentChecked, OnDestroy, ControlValueAccessor {
    protected elementRef = inject(ElementRef);
    protected cdr = inject(ChangeDetectorRef);
    protected selectionService = inject(IgxSelectionAPIService);
    protected comboAPI = inject(IgxComboAPIService);
    public document = inject<Document>(DOCUMENT);
    protected _inputGroupType = inject<IgxInputGroupType>(IGX_INPUT_GROUP_TYPE, { optional: true });
    protected _injector = inject(Injector, { optional: true });
    protected _iconService = inject(IgxIconService, { optional: true });

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
    public get showSearchCaseIcon(): boolean {
        return this.showSearchCaseIconState();
    }
    public set showSearchCaseIcon(value: boolean) {
        this.showSearchCaseIconState.set(value);
    }
    private readonly showSearchCaseIconState = signal<boolean>(false);

     /**
     * Enables/disables filtering in the list. The default is `false`.
     */
    @Input({ transform: booleanAttribute })
    public get disableFiltering(): boolean {
        return this._disableFiltering;
    }
    public set disableFiltering(value: boolean) {
        this._disableFiltering = value;
    }

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
    public overlaySettings: OverlaySettings = null!;

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
    @Input()
    public get width(): string {
        return this.widthState();
    }
    public set width(value: string) {
        this.widthState.set(value);
    }
    private readonly widthState = signal<string>(undefined!);

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
    public get allowCustomValues(): boolean {
        return this.allowCustomValuesState();
    }
    public set allowCustomValues(value: boolean) {
        this.allowCustomValuesState.set(value);
    }
    private readonly allowCustomValuesState = signal<boolean>(false);

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
        return this._itemsMaxHeight!;
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
        return this._itemHeight!;
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
    public get itemsWidth(): string {
        return this.itemsWidthState();
    }
    public set itemsWidth(value: string) {
        this.itemsWidthState.set(value);
    }
    private readonly itemsWidthState = signal<string>(undefined!);

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
    public get placeholder(): string {
        return this.placeholderState();
    }
    public set placeholder(value: string) {
        this.placeholderState.set(value);
    }
    private readonly placeholderState = signal<string>(undefined!);

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
    public get valueKey(): string {
        return this.valueKeyState();
    }
    public set valueKey(value: string) {
        this.valueKeyState.set(value);
    }
    private readonly valueKeyState = signal<string>(null!);

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
    public get filterFunction(): (collection: any[], searchValue: any, filteringOptions: IComboFilteringOptions) => any[] {
        return this.filterFunctionState();
    }
    public set filterFunction(value: (collection: any[], searchValue: any, filteringOptions: IComboFilteringOptions) => any[]) {
        this.filterFunctionState.set(value);
    }
    private readonly filterFunctionState = signal<(collection: any[], searchValue: any, filteringOptions: IComboFilteringOptions) => any[]>(undefined!);

    /**
     * Sets aria-labelledby attribute value.
     * ```html
     * <igx-combo [ariaLabelledBy]="'label1'">
     * ```
     */
    @Input()
    public get ariaLabelledBy(): string {
        return this.ariaLabelledByState();
    }
    public set ariaLabelledBy(value: string) {
        this.ariaLabelledByState.set(value);
    }
    private readonly ariaLabelledByState = signal<string>(undefined!);

    /** @hidden @internal */
    public get cssClass(): string {
        return this.cssClassState();
    }
    public set cssClass(value: string) {
        this.cssClassState.set(value);
    }
    private readonly cssClassState = signal<string>('igx-combo'); // Independent of display density for the time being

    /**
     * Disables the combo. The default is `false`.
     * ```html
     * <igx-combo [disabled]="'true'">
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get disabled(): boolean {
        return this.disabledState();
    }
    public set disabled(value: boolean) {
        this.disabledState.set(value);
    }
    private readonly disabledState = signal<boolean>(false);

    /**
     * Disables the clear button. The default is `false`.
     *
     * ```typescript
     * // get
     * let myComboDisableClear = this.combo.disableClear;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-combo [disableClear]="true"></igx-combo>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get disableClear(): boolean {
        return this.disableClearState();
    }
    public set disableClear(value: boolean) {
        this.disableClearState.set(value);
    }
    private readonly disableClearState = signal<boolean>(false);

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
        return this._resourceStrings ? this._customResourceStrings : this._defaultResourceStrings;
    }
    public set resourceStrings(value: IComboResourceStrings) {
        this._resourceStrings = value;
        this._customResourceStrings = Object.assign({}, this._defaultResourceStrings, this._resourceStrings);
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
    public get itemTemplate(): TemplateRef<any> {
        return this.itemTemplateState();
    }
    public set itemTemplate(value: TemplateRef<any>) {
        this.itemTemplateState.set(value);
    }
    private readonly itemTemplateQuery = contentChild<unknown, TemplateRef<any>>(IgxComboItemDirective, { read: TemplateRef });
    private readonly itemTemplateState = linkedSignal<TemplateRef<any>>(() => this.itemTemplateQuery() ?? undefined!);

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
    public get headerTemplate(): TemplateRef<any> {
        return this.headerTemplateState();
    }
    public set headerTemplate(value: TemplateRef<any>) {
        this.headerTemplateState.set(value);
    }
    private readonly headerTemplateQuery = contentChild<unknown, TemplateRef<any>>(IgxComboHeaderDirective, { read: TemplateRef });
    private readonly headerTemplateState = linkedSignal<TemplateRef<any>>(() => this.headerTemplateQuery() ?? undefined!);

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
    public get footerTemplate(): TemplateRef<any> {
        return this.footerTemplateState();
    }
    public set footerTemplate(value: TemplateRef<any>) {
        this.footerTemplateState.set(value);
    }
    private readonly footerTemplateQuery = contentChild<unknown, TemplateRef<any>>(IgxComboFooterDirective, { read: TemplateRef });
    private readonly footerTemplateState = linkedSignal<TemplateRef<any>>(() => this.footerTemplateQuery() ?? undefined!);

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
    public get headerItemTemplate(): TemplateRef<any> {
        return this.headerItemTemplateState();
    }
    public set headerItemTemplate(value: TemplateRef<any>) {
        this.headerItemTemplateState.set(value);
    }
    private readonly headerItemTemplateQuery = contentChild<unknown, TemplateRef<any>>(IgxComboHeaderItemDirective, { read: TemplateRef });
    private readonly headerItemTemplateState = linkedSignal<TemplateRef<any>>(() => this.headerItemTemplateQuery() ?? undefined!);

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
    public get addItemTemplate(): TemplateRef<any> {
        return this.addItemTemplateState();
    }
    public set addItemTemplate(value: TemplateRef<any>) {
        this.addItemTemplateState.set(value);
    }
    private readonly addItemTemplateQuery = contentChild<unknown, TemplateRef<any>>(IgxComboAddItemDirective, { read: TemplateRef });
    private readonly addItemTemplateState = linkedSignal<TemplateRef<any>>(() => this.addItemTemplateQuery() ?? undefined!);

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
    public get emptyTemplate(): TemplateRef<any> {
        return this.emptyTemplateState();
    }
    public set emptyTemplate(value: TemplateRef<any>) {
        this.emptyTemplateState.set(value);
    }
    private readonly emptyTemplateQuery = contentChild<unknown, TemplateRef<any>>(IgxComboEmptyDirective, { read: TemplateRef });
    private readonly emptyTemplateState = linkedSignal<TemplateRef<any>>(() => this.emptyTemplateQuery() ?? undefined!);

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
    public get toggleIconTemplate(): TemplateRef<any> {
        return this.toggleIconTemplateState();
    }
    public set toggleIconTemplate(value: TemplateRef<any>) {
        this.toggleIconTemplateState.set(value);
    }
    private readonly toggleIconTemplateQuery = contentChild<unknown, TemplateRef<any>>(IgxComboToggleIconDirective, { read: TemplateRef });
    private readonly toggleIconTemplateState = linkedSignal<TemplateRef<any>>(() => this.toggleIconTemplateQuery() ?? undefined!);

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
    public get clearIconTemplate(): TemplateRef<any> {
        return this.clearIconTemplateState();
    }
    public set clearIconTemplate(value: TemplateRef<any>) {
        this.clearIconTemplateState.set(value);
    }
    private readonly clearIconTemplateQuery = contentChild<unknown, TemplateRef<any>>(IgxComboClearIconDirective, { read: TemplateRef });
    private readonly clearIconTemplateState = linkedSignal<TemplateRef<any>>(() => this.clearIconTemplateQuery() ?? undefined!);

    /** @hidden @internal */
    public get label(): IgxLabelDirective | undefined {
        return this.labelState();
    }
    public set label(value: IgxLabelDirective | undefined) {
        this.labelState.set(value);
    }
    private readonly labelQuery = contentChild<IgxLabelDirective>(forwardRef(() => IgxLabelDirective));
    private readonly labelState = linkedSignal<IgxLabelDirective | undefined>(() => this.labelQuery());

    /** @hidden @internal */
    public get inputGroup(): IgxInputGroupComponent {
        return this.inputGroupState();
    }
    public set inputGroup(value: IgxInputGroupComponent) {
        this.inputGroupState.set(value);
    }
    private readonly inputGroupQuery = viewChild<unknown, IgxInputGroupComponent>('inputGroup', { read: IgxInputGroupComponent });
    private readonly inputGroupState = linkedSignal<IgxInputGroupComponent>(() => this.inputGroupQuery() ?? undefined!);

    /** @hidden @internal */
    public get comboInput(): IgxInputDirective {
        return this.comboInputState();
    }
    public set comboInput(value: IgxInputDirective) {
        this.comboInputState.set(value);
    }
    private readonly comboInputQuery = viewChild<unknown, IgxInputDirective>('comboInput', { read: IgxInputDirective });
    private readonly comboInputState = linkedSignal<IgxInputDirective>(() => this.comboInputQuery() ?? undefined!);

    /** @hidden @internal */
    public get searchInput(): ElementRef<HTMLInputElement> {
        return this.searchInputState();
    }
    public set searchInput(value: ElementRef<HTMLInputElement>) {
        this.searchInputState.set(value);
    }
    private readonly searchInputQuery = viewChild<ElementRef<HTMLInputElement>>('searchInput');
    private readonly searchInputState = linkedSignal<ElementRef<HTMLInputElement>>(() => this.searchInputQuery() ?? undefined!);

    /** @hidden @internal */
    @ViewChild(IgxForOfDirective, { static: true })
    public virtualScrollContainer!: IgxForOfDirective<any>;

    @ViewChild(IgxForOfDirective, { read: IgxForOfDirective, static: true })
    protected virtDir!: IgxForOfDirective<any>;

    protected get dropdownContainer(): ElementRef {
        return this.dropdownContainerState();
    }
    protected set dropdownContainer(value: ElementRef) {
        this.dropdownContainerState.set(value);
    }
    private readonly dropdownContainerQuery = viewChild<ElementRef>('dropdownItemContainer');
    private readonly dropdownContainerState = linkedSignal<ElementRef>(() => this.dropdownContainerQuery() ?? undefined!);

    protected get primitiveTemplate(): TemplateRef<any> {
        return this.primitiveTemplateState();
    }
    protected set primitiveTemplate(value: TemplateRef<any>) {
        this.primitiveTemplateState.set(value);
    }
    private readonly primitiveTemplateQuery = viewChild<unknown, TemplateRef<any>>('primitive', { read: TemplateRef });
    private readonly primitiveTemplateState = linkedSignal<TemplateRef<any>>(() => this.primitiveTemplateQuery() ?? undefined!);

    protected get complexTemplate(): TemplateRef<any> {
        return this.complexTemplateState();
    }
    protected set complexTemplate(value: TemplateRef<any>) {
        this.complexTemplateState.set(value);
    }
    private readonly complexTemplateQuery = viewChild<unknown, TemplateRef<any>>('complex', { read: TemplateRef });
    private readonly complexTemplateState = linkedSignal<TemplateRef<any>>(() => this.complexTemplateQuery() ?? undefined!);

    private readonly prefixQuery = contentChildren(IgxPrefixDirective, { descendants: true });
    protected readonly prefixes = computed(() => this.asQueryList(this.prefixQuery()));

    private readonly suffixQuery = contentChildren(IgxSuffixDirective, { descendants: true });
    protected readonly suffixes = computed(() => this.asQueryList(this.suffixQuery()));

    private readonly hintQuery = contentChildren(IgxHintDirective, { descendants: true });
    protected readonly contentHints = computed(() => this.asQueryList(this.hintQuery()));

    private readonly internalSuffixQuery = viewChildren(IgxSuffixDirective);
    protected readonly internalSuffixes = computed(() => this.asQueryList(this.internalSuffixQuery()));
    private readonly mergedSuffixes = computed(() => this.asQueryList([
        ...this.suffixes(), ...this.internalSuffixes()
    ]));

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
        return !!(this.totalItemCount > 0 &&
            this.valueKey &&
            this.dataType === DataTypes.COMPLEX);
    }

    /** @hidden @internal */
    public get dataType(): string {
        return this.dataTypeState();
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
        if (this.itemTemplate) {
            return this.itemTemplate;
        }
        if (this.dataType === DataTypes.COMPLEX) {
            return this.complexTemplate;
        }
        return this.primitiveTemplate;
    }

    /** @hidden @internal */
    public get customValueFlag(): boolean {
        return this.customValueFlagState();
    }
    public set customValueFlag(value: boolean) {
        this.customValueFlagState.set(value);
    }
    private readonly customValueFlagState = signal<boolean>(true);
    /** @hidden @internal */
    public get filterValue(): string {
        return this.filterValueState();
    }
    public set filterValue(value: string) {
        this.filterValueState.set(value);
    }
    private readonly filterValueState = signal<string>('');
    /** @hidden @internal */
    public defaultFallbackGroup = 'Other';
    /** @hidden @internal */
    public get activeDescendant(): string {
        return this.activeDescendantState();
    }
    public set activeDescendant(value: string) {
        this.activeDescendantState.set(value);
    }
    private readonly activeDescendantState = signal<string>('');

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

    protected containerSize: number | undefined = undefined;
    protected get itemSize(): number | undefined {
        return this.itemSizeState();
    }
    protected set itemSize(value: number | undefined) {
        this.itemSizeState.set(value);
    }
    private readonly itemSizeState = signal<number | undefined>(undefined);
    protected get _data(): any[] {
        return this.dataState();
    }
    protected set _data(value: any[]) {
        this.dataState.set(value);
    }
    private readonly dataState = signal<any[]>([]);
    protected get _value(): any[] {
        return this.valueState();
    }
    protected set _value(value: any[]) {
        this.valueState.set(value);
    }
    private readonly valueState = signal<any[]>([]);
    protected get _displayValue(): string {
        return this.displayValueState();
    }
    protected set _displayValue(value: string) {
        this.displayValueState.set(value);
    }
    private readonly displayValueState = signal<string>('');
    protected get _groupKey(): string {
        return this.groupKeyState();
    }
    protected set _groupKey(value: string) {
        this.groupKeyState.set(value);
    }
    private readonly groupKeyState = signal<string>('');
    protected get _searchValue(): string {
        return this.searchValueState();
    }
    protected set _searchValue(value: string) {
        this.searchValueState.set(value);
    }
    private readonly searchValueState = signal<string>('');
    protected get _filteredData(): any[] {
        return this.filteredDataState();
    }
    protected set _filteredData(value: any[]) {
        this.filteredDataState.set(value);
    }
    private readonly filteredDataState = signal<any[]>([]);
    protected get _displayKey(): string {
        return this.displayKeyState();
    }
    protected set _displayKey(value: string) {
        this.displayKeyState.set(value);
    }
    private readonly displayKeyState = signal<string>(undefined!);
    protected _remoteSelection = {};
    protected get _resourceStrings(): IComboResourceStrings {
        return this.resourceStringsState();
    }
    protected set _resourceStrings(value: IComboResourceStrings) {
        this.resourceStringsState.set(value);
    }
    private readonly resourceStringsState = signal<IComboResourceStrings>(null!);
    protected get _customResourceStrings(): IComboResourceStrings {
        return this.customResourceStringsState();
    }
    protected set _customResourceStrings(value: IComboResourceStrings) {
        this.customResourceStringsState.set(value);
    }
    private readonly customResourceStringsState = signal<IComboResourceStrings>(getCurrentResourceStrings(ComboResourceStringsEN));
    protected get _defaultResourceStrings(): IComboResourceStrings {
        return this.defaultResourceStringsState();
    }
    protected set _defaultResourceStrings(value: IComboResourceStrings) {
        this.defaultResourceStringsState.set(value);
    }
    private readonly defaultResourceStringsState = signal<IComboResourceStrings>(getCurrentResourceStrings(ComboResourceStringsEN));
    protected _valid = IgxInputState.INITIAL;
    protected ngControl: NgControl = null!;
    protected destroy$ = new Subject<void>();
    protected _onTouchedCallback: () => void = noop;
    protected _onChangeCallback: (_: any) => void = noop;
    protected readonly selectionRevision = signal(0);
    private readonly dataTypeState = computed(() => this.displayKey ? DataTypes.COMPLEX : DataTypes.PRIMITIVE);

    protected compareCollator = new Intl.Collator();
    protected computedStyles: any;

    private get _id(): string {
        return this.idState();
    }
    private set _id(value: string) {
        this.idState.set(value);
    }
    private readonly idState = signal<string>(`igx-combo-${NEXT_ID++}`);
    private get _disableFiltering(): boolean {
        return this.disableFilteringState();
    }
    private set _disableFiltering(value: boolean) {
        this.disableFilteringState.set(value);
    }
    private readonly disableFilteringState = signal<boolean>(false);
    private get _type(): IgxInputGroupType | null {
        return this.typeState();
    }
    private set _type(value: IgxInputGroupType | null) {
        this.typeState.set(value);
    }
    private readonly typeState = signal<IgxInputGroupType | null>(null);
    private get _itemHeight(): number | undefined {
        return this.itemHeightState();
    }
    private set _itemHeight(value: number | undefined) {
        this.itemHeightState.set(value);
    }
    private readonly itemHeightState = signal<number | undefined>(undefined);
    private get _itemsMaxHeight(): number | null {
        return this.itemsMaxHeightState();
    }
    private set _itemsMaxHeight(value: number | null) {
        this.itemsMaxHeightState.set(value);
    }
    private readonly itemsMaxHeightState = signal<number | null>(null);
    private get _groupSortingDirection(): SortingDirection {
        return this.groupSortingDirectionState();
    }
    private set _groupSortingDirection(value: SortingDirection) {
        this.groupSortingDirectionState.set(value);
    }
    private readonly groupSortingDirectionState = signal<SortingDirection>(SortingDirection.Asc);
    private get _filteringOptions(): IComboFilteringOptions {
        return this.filteringOptionsState();
    }
    private set _filteringOptions(value: IComboFilteringOptions) {
        this.filteringOptionsState.set(value);
    }
    private readonly filteringOptionsState = signal<IComboFilteringOptions>(undefined!);
    private _defaultFilteringOptions: IComboFilteringOptions = { caseSensitive: false };
    private itemsInContainer = 10;

    public abstract dropdown: IgxComboDropDownComponent;
    public abstract selectionChanging: EventEmitter<any>;
    public abstract selectionChanged: EventEmitter<any>;

    constructor() {
        onResourceChangeHandle(this.destroy$, () => {
            this._defaultResourceStrings = getCurrentResourceStrings(ComboResourceStringsEN, false);
            this._customResourceStrings = this._resourceStrings ? Object.assign({}, this._defaultResourceStrings, this._resourceStrings) : null!;
        }, this);
    }

    private readonly _scrollStrategy = new AbsoluteScrollStrategy();
    private readonly _positionStrategy = new AutoPositionStrategy();

    private get _overlaySettings(): OverlaySettings {
        if (!this.inputGroup) {
            return {};
        }
        const targetElement = this.inputGroup.element.nativeElement.querySelector('.igx-input-group__bundle') as HTMLElement;

        return {
            target: targetElement,
            scrollStrategy: this._scrollStrategy,
            positionStrategy: this._positionStrategy,
            modal: false,
            closeOnOutsideClick: true,
            excludeFromOutsideClick: [targetElement]
        };
    }

    /** @hidden @internal */
    public ngAfterContentChecked(): void {
        if (this.inputGroup) {
            // The input group still takes QueryLists; each list is reused until its content changes.
            this.inputGroup.prefixes = this.prefixes();
            this.inputGroup.suffixes = this.mergedSuffixes();
            this.inputGroup.hints = this.contentHints();
        }
    }

    private asQueryList<T>(items: readonly T[]): QueryList<T> {
        const list = new QueryList<T>();
        list.reset([...items]);
        return list;
    }

    /** @hidden @internal */
    public ngOnInit() {
        this.ngControl = this._injector!.get<NgControl>(NgControl, null);
        this.selectionService.set(this.id, new Set());
        this._iconService?.addSvgIconFromText(caseSensitive.name, caseSensitive.value, 'imx-icons');
        this.computedStyles = this.document.defaultView!.getComputedStyle(this.elementRef.nativeElement);
    }

    /** @hidden @internal */
    public ngAfterViewInit(): void {
        this.filteredData = [...this.data!];
        if (this.ngControl) {
            this.ngControl.statusChanges!.pipe(takeUntil(this.destroy$)).subscribe(this.onStatusChanged);
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
        this.selectionRevision();
        const serviceRef = this.selectionService.get(this.id);
        return serviceRef ? this.convertKeysToItems(Array.from(serviceRef)) : [];
    }

    /**
     * Returns if the specified itemID is selected
     *
     * @hidden
     * @internal
     */
    public isItemSelected(item: any): boolean {
        this.selectionRevision();
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
        const oldCollection = [...this.data!];
        const newCollection = [...this.data!, addedItem];
        const args: IComboItemAdditionEvent = {
            oldCollection, addedItem, newCollection, owner: this, cancel: false
        };
        this.addition.emit(args);
        if (args.cancel) {
            return;
        }
        this.data!.push(args.addedItem);
        // trigger re-render
        this.data = cloneArray(this.data!);
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
                this.filterValue = null!;
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
        const isTab = (e.event as KeyboardEvent)?.key === 'Tab';
        if (!e.event || isTab) {
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
        if (event.key === 'Tab') {
            this.close();
        }
    }

    /** @hidden @internal */
    public getAriaLabel(): string {
        return (this.displayValue ? this.resourceStrings.igx_combo_aria_label_options : this.resourceStrings.igx_combo_aria_label_no_options)!;
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
    public onClick(event: MouseEvent) {
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
        if (this.ngControl && this.isTouchedOrDirty && !this.ngControl.disabled) {
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
        this.cdr.markForCheck();
    };

    private updateValidity() {
        if (this.ngControl && this.ngControl.invalid) {
            this.valid = IgxInputState.INVALID;
        } else {
            this.valid = IgxInputState.INITIAL;
        }
    }

    private get isTouchedOrDirty(): boolean {
        return (this.ngControl.control!.touched || this.ngControl.control!.dirty);
    }

    private get hasValidators(): boolean {
        return (!!this.ngControl.control!.validator || !!this.ngControl.control!.asyncValidator);
    }

    /** if there is a valueKey - map the keys to data items, else - just return the keys */
    protected convertKeysToItems(keys: any[]) {
        if (this.valueKey === null || this.valueKey === undefined) {
            return keys;
        }

        return keys.map(key => {
            const item = this.data!.find(entry => isEqual(entry[this.valueKey], key));

            return item !== undefined ? item : { [this.valueKey]: key };
        });
    }

    protected checkMatch(): void {
        const itemMatch = this.filteredData!.some(this.findMatch);
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
                (this._remoteSelection as any)[entry[this.valueKey]] = entry[this.displayKey];
            }
        } else {
            for (const entry of ids) {
                delete (this._remoteSelection as any)[entry];
            }
        }
    }

    /**
     * For `id: any[]` returns a mapped `{ [combo.valueKey]: any, [combo.displayKey]: any }[]`
     */
    protected getValueDisplayPairs(ids: any[]) {
        return this.data!.filter(entry => ids.indexOf(entry[this.valueKey]) > -1).map(e => ({
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
        return Object.keys(this._remoteSelection).map(e => (this._remoteSelection as any)[e]).join(', ');
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

    public abstract handleOpened(): any;
    public abstract onArrowDown(event: Event): any;
    public abstract focusSearchInput(opening?: boolean): any;

    public abstract select(newItem: any): void;
    public abstract select(newItems: Array<any> | any, clearCurrentSelection?: boolean, event?: Event): void;

    public abstract deselect(...args: [] | [items: Array<any>, event?: Event]): void;

    public abstract writeValue(value: any): void;

    protected abstract setSelection(newSelection: Set<any>, event?: Event): void;
    protected abstract createDisplayText(newSelection: any[], oldSelection: any[]): any;
}
