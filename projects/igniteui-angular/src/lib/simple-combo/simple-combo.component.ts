import { DOCUMENT, NgIf, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit, ChangeDetectorRef, Component, DoCheck, ElementRef, EventEmitter, HostListener, Inject, Injector,
    Optional, Output, ViewChild
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

import { IgxComboAddItemComponent } from '../combo/combo-add-item.component';
import { IgxComboDropDownComponent } from '../combo/combo-dropdown.component';
import { IgxComboItemComponent } from '../combo/combo-item.component';
import { IgxComboAPIService } from '../combo/combo.api';
import { IgxComboBaseDirective, IGX_COMBO_COMPONENT } from '../combo/combo.common';
import { IgxSelectionAPIService } from '../core/selection';
import { CancelableEventArgs, IBaseCancelableBrowserEventArgs, IBaseEventArgs, PlatformUtil } from '../core/utils';
import { IgxButtonDirective } from '../directives/button/button.directive';
import { IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { IgxRippleDirective } from '../directives/ripple/ripple.directive';
import { IgxTextSelectionDirective } from '../directives/text-selection/text-selection.directive';
import { IgxIconService } from '../icon/icon.service';
import { IgxInputGroupType, IGX_INPUT_GROUP_TYPE } from '../input-group/public_api';
import { IgxComboFilteringPipe, IgxComboGroupingPipe } from '../combo/combo.pipes';
import { IgxDropDownItemNavigationDirective } from '../drop-down/drop-down-navigation.directive';
import { IgxIconComponent } from '../icon/icon.component';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';
import { IgxInputDirective } from '../directives/input/input.directive';
import { IgxInputGroupComponent } from '../input-group/input-group.component';

/** Emitted when an igx-simple-combo's selection is changing.  */
export interface ISimpleComboSelectionChangingEventArgs extends CancelableEventArgs, IBaseEventArgs {
    /** An object which represents the value that is currently selected */
    oldValue: any;
    /** An object which represents the value that will be selected after this event */
    newValue: any;
    /** An object which represents the item that is currently selected */
    oldSelection: any;
    /** An object which represents the item that will be selected after this event */
    newSelection: any;
    /** The text that will be displayed in the combo text box */
    displayText: string;
}

/**
 * Represents a drop-down list that provides filtering functionality, allowing users to choose a single option from a predefined list.
 *
 * @igxModule IgxSimpleComboModule
 * @igxTheme igx-combo-theme
 * @igxKeywords combobox, single combo selection
 * @igxGroup Grids & Lists
 *
 * @remarks
 * It provides the ability to filter items as well as perform single selection on the provided data.
 * Additionally, it exposes keyboard navigation and custom styling capabilities.
 * @example
 * ```html
 * <igx-simple-combo [itemsMaxHeight]="250" [data]="locationData"
 *  [displayKey]="'field'" [valueKey]="'field'"
 *  placeholder="Location" searchPlaceholder="Search...">
 * </igx-simple-combo>
 * ```
 */
@Component({
    selector: 'igx-simple-combo',
    templateUrl: 'simple-combo.component.html',
    providers: [
        IgxComboAPIService,
        { provide: IGX_COMBO_COMPONENT, useExisting: IgxSimpleComboComponent },
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxSimpleComboComponent, multi: true }
    ],
    imports: [IgxInputGroupComponent, IgxInputDirective, IgxTextSelectionDirective, NgIf, IgxSuffixDirective, NgTemplateOutlet, IgxIconComponent, IgxComboDropDownComponent, IgxDropDownItemNavigationDirective, IgxForOfDirective, IgxComboItemComponent, IgxComboAddItemComponent, IgxButtonDirective, IgxRippleDirective, IgxComboFilteringPipe, IgxComboGroupingPipe]
})
export class IgxSimpleComboComponent extends IgxComboBaseDirective implements ControlValueAccessor, AfterViewInit, DoCheck {
    /** @hidden @internal */
    @ViewChild(IgxComboDropDownComponent, { static: true })
    public dropdown: IgxComboDropDownComponent;

    /** @hidden @internal */
    @ViewChild(IgxComboAddItemComponent)
    public addItem: IgxComboAddItemComponent;

    /**
     * Emitted when item selection is changing, before the selection completes
     *
     * ```html
     * <igx-simple-combo (selectionChanging)='handleSelection()'></igx-simple-combo>
     * ```
     */
    @Output()
    public selectionChanging = new EventEmitter<ISimpleComboSelectionChangingEventArgs>();

    @ViewChild(IgxTextSelectionDirective, { static: true })
    private textSelection: IgxTextSelectionDirective;

    public override get value(): any {
        return this._value[0];
    }

    /**
     * Get current selection state
     *
     * @returns The selected item, if any
     * ```typescript
     * let mySelection = this.combo.selection;
     * ```
     */
    public override get selection(): any {
        return super.selection[0];
    }

    /** @hidden @internal */
    public composing = false;

    private _updateInput = true;

    private _collapsing = false;

    /** @hidden @internal */
    public get filteredData(): any[] | null {
        return this._filteredData;
    }
    /** @hidden @internal */
    public set filteredData(val: any[] | null) {
        this._filteredData = this.groupKey ? (val || []).filter((e) => e.isHeader !== true) : val;
        this.checkMatch();
    }

    /** @hidden @internal */
    public override get searchValue(): string {
        return this._searchValue;
    }
    public override set searchValue(val: string) {
        this._searchValue = val;
    }

    private get selectedItem(): any {
        return this.selectionService.get(this.id).values().next().value;
    }

    protected get hasSelectedItem(): boolean {
        return !!this.selectionService.get(this.id).size;
    }

    constructor(elementRef: ElementRef,
        cdr: ChangeDetectorRef,
        selectionService: IgxSelectionAPIService,
        comboAPI: IgxComboAPIService,
        private platformUtil: PlatformUtil,
        @Inject(DOCUMENT) document: any,
        @Optional() @Inject(IGX_INPUT_GROUP_TYPE) _inputGroupType: IgxInputGroupType,
        @Optional() _injector: Injector,
        @Optional() @Inject(IgxIconService) _iconService?: IgxIconService,
        @Optional() private formGroupDirective?: FormGroupDirective
    ) {
        super(
            elementRef,
            cdr,
            selectionService,
            comboAPI,
            document,
            _inputGroupType,
            _injector,
            _iconService
        );
        this.comboAPI.register(this);
    }

    /** @hidden @internal */
    @HostListener('keydown.ArrowDown', ['$event'])
    @HostListener('keydown.Alt.ArrowDown', ['$event'])
    public onArrowDown(event: Event): void {
        if (this.collapsed) {
            event.preventDefault();
            event.stopPropagation();
            this.open();
        } else {
            if (this.virtDir.igxForOf.length > 0 && !this.hasSelectedItem) {
                this.dropdown.navigateNext();
                this.dropdownContainer.nativeElement.focus();
            } else if (this.allowCustomValues) {
                this.addItem?.element.nativeElement.focus();
            }
        }
    }

    /**
     * Select a defined item
     *
     * @param item the item to be selected
     * ```typescript
     * this.combo.select("New York");
     * ```
     */
    public select(item: any): void {
        if (item !== undefined) {
            const newSelection = this.selectionService.add_items(this.id, item instanceof Array ? item : [item], true);
            this.setSelection(newSelection);
        }
    }

    /**
     * Deselect the currently selected item
     *
     * @param item the items to be deselected
     * ```typescript
     * this.combo.deselect("New York");
     * ```
     */
    public deselect(): void {
        this.clearSelection();
    }

    /** @hidden @internal */
    public writeValue(value: any): void {
        const oldSelection = super.selection;
        this.selectionService.select_items(this.id, this.isValid(value) ? [value] : [], true);
        this.cdr.markForCheck();
        this._displayValue = this.createDisplayText(super.selection, oldSelection);
        this._value = this.valueKey ? super.selection.map(item => item[this.valueKey]) : super.selection;
        this.filterValue = this._displayValue?.toString() || '';
    }

    /** @hidden @internal */
    public override ngAfterViewInit(): void {
        this.virtDir.contentSizeChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (super.selection.length > 0) {
                const index = this.virtDir.igxForOf.findIndex(e => {
                    let current = e? e[this.valueKey] : undefined;
                    if (this.valueKey === null || this.valueKey === undefined) {
                        current = e;
                    }
                    return current === super.selection[0];
                });
                if (!this.isRemote) {
                    // navigate to item only if we have local data
                    // as with remote data this will fiddle with igxFor's scroll handler
                    // and will trigger another chunk load which will break the visualization
                    this.dropdown.navigateItem(index);
                }
            }
        });
        this.dropdown.opening.pipe(takeUntil(this.destroy$)).subscribe((args) => {
            if (args.cancel) {
                return;
            }
            this._collapsing = false;
            const filtered = this.filteredData.find(this.findAllMatches);
            if (filtered === undefined || filtered === null) {
                this.filterValue = this.searchValue = this.comboInput.value;
                return;
            }
        });
        this.dropdown.opened.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.composing) {
                this.comboInput.focus();
            }
        });
        this.dropdown.closing.pipe(takeUntil(this.destroy$)).subscribe((args) => {
            if (args.cancel) {
                return;
            }
            if (this.getEditElement() && !args.event) {
                this._collapsing = true;
            } else {
                this.clearOnBlur();
                this._onTouchedCallback();
            }
            this.comboInput.focus();
        });

        // in reactive form the control is not present initially
        // and sets the selection to an invalid value in writeValue method
        if (!this.isValid(this.selectedItem)) {
            this.selectionService.clear(this.id);
            this._displayValue = '';
        }

        super.ngAfterViewInit();
    }

    /** @hidden @internal */
    public ngDoCheck(): void {
        if (this.data?.length && super.selection.length && !this._displayValue) {
            this._displayValue = this.createDisplayText(super.selection, []);
            this._value = this.valueKey ? super.selection.map(item => item[this.valueKey]) : super.selection;
        }
    }

    /** @hidden @internal */
    public override handleInputChange(event?: any): void {
        if (this.collapsed && this.comboInput.focused) {
            this.open();
        }
        if (event !== undefined) {
            this.filterValue = this.searchValue = typeof event === 'string' ? event : event.target.value;
        }
        if (!this.comboInput.value.trim() && super.selection.length) {
            // handle clearing of input by space
            this.clearSelection();
            this._onChangeCallback(null);
            this.filterValue = '';
        }
        if (super.selection.length) {
            const args: ISimpleComboSelectionChangingEventArgs = {
                newValue: undefined,
                oldValue: this.selectedItem,
                newSelection: undefined,
                oldSelection: this.selection,
                displayText: typeof event === 'string' ? event : event?.target?.value,
                owner: this,
                cancel: false
            };
            this.selectionChanging.emit(args);
            if (!args.cancel) {
                this.selectionService.select_items(this.id, [], true);
            }
        }
        // when filtering the focused item should be the first item or the currently selected item
        if (!this.dropdown.focusedItem || this.dropdown.focusedItem.id !== this.dropdown.items[0].id) {
            this.dropdown.navigateFirst();
        }
        super.handleInputChange(event);
        this.composing = true;
    }

    /** @hidden @internal */
    public handleInputClick(): void {
        if (this.collapsed) {
            this.open();
            this.comboInput.focus();
        }
    }

    /** @hidden @internal */
    public override handleKeyDown(event: KeyboardEvent): void {
        if (event.key === this.platformUtil.KEYMAP.ENTER) {
            const filtered = this.filteredData.find(this.findAllMatches);
            if (filtered === null || filtered === undefined) {
                return;
            }
            if (!this.dropdown.collapsed) {
                const focusedItem = this.dropdown.focusedItem;
                if (focusedItem && !focusedItem.isHeader) {
                    this.select(focusedItem.itemID);
                    event.preventDefault();
                    event.stopPropagation();
                    this.close();
                } else {
                    event.preventDefault();
                    event.stopPropagation();
                    this.comboInput.focus();
                }
            }
            // manually trigger text selection as it will not be triggered during editing
            this.textSelection.trigger();
            return;
        }
        if (event.key === this.platformUtil.KEYMAP.BACKSPACE
            || event.key === this.platformUtil.KEYMAP.DELETE) {
            this._updateInput = false;
            this.clearSelection(true);
        }
        if (!this.collapsed && event.key === this.platformUtil.KEYMAP.TAB) {
            const filtered = this.filteredData.find(this.findAllMatches);
            if (filtered === null || filtered === undefined) {
                this.clearOnBlur();
                this.close();
                return;
            }
            const focusedItem = this.dropdown.focusedItem;
            if (focusedItem && !focusedItem.isHeader) {
                this.select(focusedItem.itemID);
                this.close();
                this.textSelection.trigger();
            } else {
                this.clearOnBlur();
                this.close();
            }
        }
        this.composing = false;
        super.handleKeyDown(event);
    }

    /** @hidden @internal */
    public handleKeyUp(event: KeyboardEvent): void {
        if (event.key === this.platformUtil.KEYMAP.ARROW_DOWN) {
            this.dropdown.focusedItem = this.hasSelectedItem && this.filteredData.length > 0
                ? this.dropdown.items.find(i => i.itemID === this.selectedItem)
                : this.dropdown.items[0];
            this.dropdownContainer.nativeElement.focus();
        }
    }

    /** @hidden @internal */
    public handleItemKeyDown(event: KeyboardEvent): void {
        if (event.key === this.platformUtil.KEYMAP.ARROW_UP && event.altKey) {
            this.close();
            this.comboInput.focus();
            return;
        }
        if (event.key === this.platformUtil.KEYMAP.ENTER) {
            this.comboInput.focus();
        }
    }

    /** @hidden @internal */
    public handleItemClick(): void {
        this.close();
        this.comboInput.focus();
    }

    /** @hidden @internal */
    public override onBlur(): void {
        // when clicking the toggle button to close the combo and immediately clicking outside of it
        // the collapsed state is not modified as the dropdown is still not closed
        if (this.collapsed || this._collapsing) {
            this.clearOnBlur();
        }
        super.onBlur();
    }

    /** @hidden @internal */
    public getEditElement(): HTMLElement {
        return this.comboInput.nativeElement;
    }

    /** @hidden @internal */
    public handleClear(event: Event): void {
        if (this.disabled) {
            return;
        }

        const oldSelection = this.selection;
        this.clearSelection(true);

        if(!this.collapsed){
            this.focusSearchInput(true);
        }
        event.stopPropagation();

        if (this.selection !== oldSelection) {
            this.comboInput.value = this.filterValue = this.searchValue = '';
        }

        this.dropdown.focusedItem = null;
        this.composing = false;
        this.comboInput.focus();
    }

    /** @hidden @internal */
    public handleOpened(): void {
        this.triggerCheck();
        if (!this.comboInput.focused) {
            this.dropdownContainer.nativeElement.focus();
        }
        this.opened.emit({ owner: this });
    }

    /** @hidden @internal */
    public override handleClosing(e: IBaseCancelableBrowserEventArgs): void {
        const args: IBaseCancelableBrowserEventArgs = { owner: this, event: e.event, cancel: e.cancel };
        this.closing.emit(args);
        e.cancel = args.cancel;
        if (e.cancel) {
            return;
        }

        this.composing = false;
        // explicitly update selection and trigger text selection so that we don't have to force CD
        this.textSelection.selected = true;
        this.textSelection.trigger();
    }

    /** @hidden @internal */
    public focusSearchInput(opening?: boolean): void {
        if (opening) {
            this.dropdownContainer.nativeElement.focus();
        } else {
            this.comboInput.nativeElement.focus();
        }
    }

    /** @hidden @internal */
    public override onClick(event: Event): void {
        super.onClick(event);
        if (this.comboInput.value.length === 0) {
            this.virtDir.scrollTo(0);
        }
    }

    protected findAllMatches = (element: any): boolean => {
        const value = this.displayKey ? element[this.displayKey] : element;
        if (value === null || value === undefined || value === '') {
            // we can accept null, undefined and empty strings as empty display values
            return true;
        }
        const searchValue = this.searchValue || this.comboInput.value;
        return !!searchValue && value.toString().toLowerCase().includes(searchValue.toLowerCase());
    };

    protected setSelection(newSelection: any): void {
        const newValueAsArray = newSelection ? Array.from(newSelection) as IgxComboItemComponent[] : [];
        const oldValueAsArray = Array.from(this.selectionService.get(this.id) || []);
        const newItems = this.convertKeysToItems(newValueAsArray);
        const oldItems = this.convertKeysToItems(oldValueAsArray);
        const displayText = this.createDisplayText(this.convertKeysToItems(newValueAsArray), oldValueAsArray);
        const args: ISimpleComboSelectionChangingEventArgs = {
            newValue: newValueAsArray[0],
            oldValue: oldValueAsArray[0],
            newSelection: newItems[0],
            oldSelection: oldItems[0],
            displayText,
            owner: this,
            cancel: false
        };
        if (args.newSelection !== args.oldSelection) {
            this.selectionChanging.emit(args);
        }
        // TODO: refactor below code as it sets the selection and the display text
        if (!args.cancel) {
            let argsSelection = this.isValid(args.newValue)
                ? args.newValue
                : [];
            argsSelection = Array.isArray(argsSelection) ? argsSelection : [argsSelection];
            this.selectionService.select_items(this.id, argsSelection, true);
            this._value = argsSelection;
            if (this._updateInput) {
                this.comboInput.value = this._displayValue = this.searchValue = displayText !== args.displayText
                    ? args.displayText
                    : this.createDisplayText(super.selection, [args.oldValue]);
            }
            this._onChangeCallback(args.newValue);
            this._updateInput = true;
        } else if (this.isRemote) {
            this.registerRemoteEntries(newValueAsArray, false);
        } else {
            args.displayText = this.createDisplayText(oldItems, []);

            const oldSelectionArray = args.oldSelection ? [args.oldSelection] : [];
            this.comboInput.value = this._displayValue = this.searchValue = this.createDisplayText(oldSelectionArray, []);

            if (this.isRemote) {
                this.registerRemoteEntries(newValueAsArray, false);
            }
        }
    }

    protected createDisplayText(newSelection: any[], oldSelection: any[]): string {
        if (this.isRemote) {
            const selection = this.valueKey ? newSelection.map(item => item[this.valueKey]) : newSelection;
            return this.getRemoteSelection(selection, oldSelection);
        }

        if (this.displayKey !== null
            && this.displayKey !== undefined
            && newSelection.length > 0) {
            return newSelection.filter(e => e).map(e => e[this.displayKey])[0]?.toString() || '';
        }

        return newSelection[0]?.toString() || '';
    }

    protected override getRemoteSelection(newSelection: any[], oldSelection: any[]): string {
        if (!newSelection.length) {
            this.registerRemoteEntries(oldSelection, false);
            return '';
        }

        this.registerRemoteEntries(oldSelection, false);
        this.registerRemoteEntries(newSelection);
        return Object.keys(this._remoteSelection).map(e => this._remoteSelection[e])[0] || '';
    }

    /** Contains key-value pairs of the selected valueKeys and their resp. displayKeys */
    protected override registerRemoteEntries(ids: any[], add = true) {
        const selection = this.getValueDisplayPairs(ids)[0];

        if (add && selection) {
            this._remoteSelection[selection[this.valueKey]] = selection[this.displayKey].toString();
        } else {
            this._remoteSelection = {};
        }
    }

    private clearSelection(ignoreFilter?: boolean): void {
        let newSelection = this.selectionService.get_empty();
        if (this.filteredData.length !== this.data.length && !ignoreFilter) {
            newSelection = this.selectionService.delete_items(this.id, this.selectionService.get_all_ids(this.filteredData, this.valueKey));
        }
        if (this.selectionService.get(this.id).size > 0 || this.comboInput.value.trim()) {
            this.setSelection(newSelection);
        }
    }

    private clearOnBlur(): void {
        if (this.isRemote) {
            const searchValue = this.searchValue || this.comboInput.value;
            const remoteValue = Object.keys(this._remoteSelection).map(e => this._remoteSelection[e])[0] || '';
            if (searchValue !== remoteValue) {
                this.clear();
            }
            return;
        }

        const filtered = this.filteredData.find(this.findMatch);
        // selecting null in primitive data returns undefined as the search text is '', but the item is null
        if (filtered === undefined && this.selectedItem !== null || !super.selection.length) {
            this.clear();
        }
    }

    private getElementVal(element: any): string {
        const elementVal = this.displayKey ? element[this.displayKey] : element;
        return String(elementVal);
    }

    private clear(): void {
        this.clearSelection(true);
        const oldSelection = this.selection;
        if (this.selection !== oldSelection) {
            this.comboInput.value = this._displayValue = this.searchValue = '';
        }
    }

    private isValid(value: any): boolean {
        if (this.formGroupDirective && value === null) {
            return false;
        }

        if (this.required) {
            return value !== null && value !== '' && value !== undefined
        }

        return value !== undefined;
    }
}
