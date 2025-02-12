import { DOCUMENT, NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, OnDestroy,
    Optional, Inject, Injector, ViewChild, Input, Output, EventEmitter, HostListener, DoCheck, booleanAttribute
} from '@angular/core';

import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import { IgxSelectionAPIService } from '../core/selection';
import { IBaseEventArgs, IBaseCancelableEventArgs, CancelableEventArgs } from '../core/utils';
import { IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { IgxIconService } from '../icon/icon.service';
import { IgxRippleDirective } from '../directives/ripple/ripple.directive';
import { IgxButtonDirective } from '../directives/button/button.directive';
import { IgxInputGroupComponent } from '../input-group/input-group.component';
import { IgxComboItemComponent } from './combo-item.component';
import { IgxComboDropDownComponent } from './combo-dropdown.component';
import { IgxComboFilteringPipe, IgxComboGroupingPipe } from './combo.pipes';
import { IGX_COMBO_COMPONENT, IgxComboBaseDirective } from './combo.common';
import { IgxComboAddItemComponent } from './combo-add-item.component';
import { IgxComboAPIService } from './combo.api';
import { EditorProvider } from '../core/edit-provider';
import { IgxInputGroupType, IGX_INPUT_GROUP_TYPE } from '../input-group/public_api';
import { IgxDropDownItemNavigationDirective } from '../drop-down/drop-down-navigation.directive';
import { IgxIconComponent } from '../icon/icon.component';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';
import { IgxInputDirective } from '../directives/input/input.directive';

/** Event emitted when an igx-combo's selection is changing */
export interface IComboSelectionChangingEventArgs extends IBaseCancelableEventArgs {
    /** An array containing the values that are currently selected */
    oldValue: any[];
    /** An array containing the values that will be selected after this event */
    newValue: any[];
    /** An array containing the items that are currently selected */
    oldSelection: any[];
    /** An array containing the items that will be selected after this event */
    newSelection: any[];
    /** An array containing the items that will be added to the selection (if any) */
    added: any[];
    /** An array containing the items that will be removed from the selection (if any) */
    removed: any[];
    /** The text that will be displayed in the combo text box */
    displayText: string;
    /** The user interaction that triggered the selection change */
    event?: Event;
}

/** Event emitted when the igx-combo's search input changes */
export interface IComboSearchInputEventArgs extends IBaseCancelableEventArgs {
    /** The text that has been typed into the search input */
    searchText: string;
}

export interface IComboItemAdditionEvent extends IBaseEventArgs, CancelableEventArgs {
    oldCollection: any[];
    addedItem: any;
    newCollection: any[];
}

/**
 * When called with sets A & B, returns A - B (as array);
 *
 * @hidden
 */
const diffInSets = (set1: Set<any>, set2: Set<any>): any[] => {
    const results = [];
    set1.forEach(entry => {
        if (!set2.has(entry)) {
            results.push(entry);
        }
    });
    return results;
};

/**
 *  Represents a drop-down list that provides editable functionalities, allowing users to choose an option from a predefined list.
 *
 * @igxModule IgxComboModule
 * @igxTheme igx-combo-theme
 * @igxKeywords combobox, combo selection
 * @igxGroup Grids & Lists
 *
 * @remarks
 * It provides the ability to filter items as well as perform selection with the provided data.
 * Additionally, it exposes keyboard navigation and custom styling capabilities.
 * @example
 * ```html
 * <igx-combo [itemsMaxHeight]="250" [data]="locationData"
 *  [displayKey]="'field'" [valueKey]="'field'"
 *  placeholder="Location(s)" searchPlaceholder="Search...">
 * </igx-combo>
 * ```
 */
@Component({
    selector: 'igx-combo',
    templateUrl: 'combo.component.html',
    providers: [
        IgxComboAPIService,
        { provide: IGX_COMBO_COMPONENT, useExisting: IgxComboComponent },
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxComboComponent, multi: true }
    ],
    imports: [
        NgIf,
        NgTemplateOutlet,
        NgClass,
        FormsModule,
        IgxInputGroupComponent,
        IgxInputDirective,
        IgxSuffixDirective,
        IgxIconComponent,
        IgxComboDropDownComponent,
        IgxDropDownItemNavigationDirective,
        IgxForOfDirective,
        IgxComboItemComponent,
        IgxComboAddItemComponent,
        IgxButtonDirective,
        IgxRippleDirective,
        IgxComboFilteringPipe,
        IgxComboGroupingPipe
    ]
})
export class IgxComboComponent extends IgxComboBaseDirective implements AfterViewInit, ControlValueAccessor, OnInit,
    OnDestroy, DoCheck, EditorProvider {
    /**
     * Whether the combo's search box should be focused after the dropdown is opened.
     * When `false`, the combo's list item container will be focused instead
     */
    @Input({ transform: booleanAttribute })
    public autoFocusSearch = true;

    /**
     * Enables/disables filtering in the list. The default is `false`.
     */
    @Input({ transform: booleanAttribute })
    public get disableFiltering(): boolean {
        return this._disableFiltering || this.filteringOptions.filterable === false;
    }
    public set disableFiltering(value: boolean) {
        this._disableFiltering = value;
    }

    /**
     * Defines the placeholder value for the combo dropdown search field
     *
     * @deprecated in version 18.2.0. Replaced with values in the localization resource strings.
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
    public searchPlaceholder: string;

    /**
     * Emitted when item selection is changing, before the selection completes
     *
     * ```html
     * <igx-combo (selectionChanging)='handleSelection()'></igx-combo>
     * ```
     */
    @Output()
    public selectionChanging = new EventEmitter<IComboSelectionChangingEventArgs>();

    /** @hidden @internal */
    @ViewChild(IgxComboDropDownComponent, { static: true })
    public dropdown: IgxComboDropDownComponent;

    /** @hidden @internal */
    public get filteredData(): any[] | null {
        return this.disableFiltering ? this.data : this._filteredData;
    }
    /** @hidden @internal */
    public set filteredData(val: any[] | null) {
        this._filteredData = this.groupKey ? (val || []).filter((e) => e.isHeader !== true) : val;
        this.checkMatch();
    }

    protected _prevInputValue = '';

    private _displayText: string;
    private _disableFiltering = false;

    constructor(
        elementRef: ElementRef,
        cdr: ChangeDetectorRef,
        selectionService: IgxSelectionAPIService,
        comboAPI: IgxComboAPIService,
        @Inject(DOCUMENT) document: any,
        @Optional() @Inject(IGX_INPUT_GROUP_TYPE) _inputGroupType: IgxInputGroupType,
        @Optional() _injector: Injector,
        @Optional() @Inject(IgxIconService) _iconService?: IgxIconService,
    ) {
        super(elementRef, cdr, selectionService, comboAPI, document, _inputGroupType, _injector, _iconService);
        this.comboAPI.register(this);
    }

    @HostListener('keydown.ArrowDown', ['$event'])
    @HostListener('keydown.Alt.ArrowDown', ['$event'])
    public onArrowDown(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.open();
    }

    /** @hidden @internal */
    public get displaySearchInput(): boolean {
        return !this.disableFiltering || this.allowCustomValues;
    }

    /**
     * @hidden @internal
     */
    public handleKeyUp(event: KeyboardEvent): void {
        // TODO: use PlatformUtil for keyboard navigation
        if (event.key === 'ArrowDown' || event.key === 'Down') {
            this.dropdown.focusedItem = this.dropdown.items[0];
            this.dropdownContainer.nativeElement.focus();
        } else if (event.key === 'Escape' || event.key === 'Esc') {
            this.toggle();
        }
    }

    /**
     * @hidden @internal
     */
    public handleSelectAll(evt) {
        if (evt.checked) {
            this.selectAllItems();
        } else {
            this.deselectAllItems();
        }
    }

    /**
     * @hidden @internal
     */
    public writeValue(value: any[]): void {
        const selection = Array.isArray(value) ? value.filter(x => x !== undefined) : [];
        const oldSelection = this.selection;
        this.selectionService.select_items(this.id, selection, true);
        this.cdr.markForCheck();
        this._displayValue = this.createDisplayText(this.selection, oldSelection);
        this._value = this.valueKey ? this.selection.map(item => item[this.valueKey]) : this.selection;
    }

    /** @hidden @internal */
    public ngDoCheck(): void {
        if (this.data?.length && this.selection.length) {
            this._displayValue = this._displayText || this.createDisplayText(this.selection, []);
            this._value = this.valueKey ? this.selection.map(item => item[this.valueKey]) : this.selection;
        }
    }

    /**
     * @hidden
     */
    public getEditElement(): HTMLElement {
        return this.comboInput.nativeElement;
    }

    /**
     * @hidden @internal
     */
    public get context(): any {
        return {
            $implicit: this
        };
    }

    /**
     * @hidden @internal
     */
    public handleClearItems(event: Event): void {
        if (this.disabled) {
            return;
        }
        this.deselectAllItems(true, event);
        if (this.collapsed) {
            this.getEditElement().focus();
        } else {
            this.focusSearchInput(true);
        }
        event.stopPropagation();
    }

    /**
     * Select defined items
     *
     * @param newItems new items to be selected
     * @param clearCurrentSelection if true clear previous selected items
     * ```typescript
     * this.combo.select(["New York", "New Jersey"]);
     * ```
     */
    public select(newItems: Array<any>, clearCurrentSelection?: boolean, event?: Event) {
        if (newItems) {
            const newSelection = this.selectionService.add_items(this.id, newItems, clearCurrentSelection);
            this.setSelection(newSelection, event);
        }
    }

    /**
     * Deselect defined items
     *
     * @param items items to deselected
     * ```typescript
     * this.combo.deselect(["New York", "New Jersey"]);
     * ```
     */
    public deselect(items: Array<any>, event?: Event) {
        if (items) {
            const newSelection = this.selectionService.delete_items(this.id, items);
            this.setSelection(newSelection, event);
        }
    }

    /**
     * Select all (filtered) items
     *
     * @param ignoreFilter if set to true, selects all items, otherwise selects only the filtered ones.
     * ```typescript
     * this.combo.selectAllItems();
     * ```
     */
    public selectAllItems(ignoreFilter?: boolean, event?: Event) {
        const allVisible = this.selectionService.get_all_ids(ignoreFilter ? this.data : this.filteredData, this.valueKey);
        const newSelection = this.selectionService.add_items(this.id, allVisible);
        this.setSelection(newSelection, event);
    }

    /**
     * Deselect all (filtered) items
     *
     * @param ignoreFilter if set to true, deselects all items, otherwise deselects only the filtered ones.
     * ```typescript
     * this.combo.deselectAllItems();
     * ```
     */
    public deselectAllItems(ignoreFilter?: boolean, event?: Event): void {
        let newSelection = this.selectionService.get_empty();
        if (this.filteredData.length !== this.data.length && !ignoreFilter) {
            newSelection = this.selectionService.delete_items(this.id, this.selectionService.get_all_ids(this.filteredData, this.valueKey));
        }
        this.setSelection(newSelection, event);
    }

    /**
     * Selects/Deselects a single item
     *
     * @param itemID the itemID of the specific item
     * @param select If the item should be selected (true) or deselected (false)
     *
     * Without specified valueKey;
     * ```typescript
     * this.combo.valueKey = null;
     * const items: { field: string, region: string}[] = data;
     * this.combo.setSelectedItem(items[0], true);
     * ```
     * With specified valueKey;
     * ```typescript
     * this.combo.valueKey = 'field';
     * const items: { field: string, region: string}[] = data;
     * this.combo.setSelectedItem('Connecticut', true);
     * ```
     */
    public setSelectedItem(itemID: any, select = true, event?: Event): void {
        if (itemID === undefined) {
            return;
        }
        if (select) {
            this.select([itemID], false, event);
        } else {
            this.deselect([itemID], event);
        }
    }

    /** @hidden @internal */
    public handleOpened() {
        this.triggerCheck();

        // Disabling focus of the search input should happen only when drop down opens.
        // During keyboard navigation input should receive focus, even the autoFocusSearch is disabled.
        // That is why in such cases focusing of the dropdownContainer happens outside focusSearchInput method.
        if (this.autoFocusSearch) {
            this.focusSearchInput(true);
        } else {
            this.dropdownContainer.nativeElement.focus();
        }
        this.opened.emit({ owner: this });
    }

    /** @hidden @internal */
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

    protected setSelection(selection: Set<any>, event?: Event): void {
        const currentSelection = this.selectionService.get(this.id);
        const removed = this.convertKeysToItems(diffInSets(currentSelection, selection));
        const added = this.convertKeysToItems(diffInSets(selection, currentSelection));
        const newValue = Array.from(selection);
        const oldValue = Array.from(currentSelection || []);
        const newSelection = this.convertKeysToItems(newValue);
        const oldSelection = this.convertKeysToItems(oldValue);
        const displayText = this.createDisplayText(this.convertKeysToItems(newValue), oldValue);
        const args: IComboSelectionChangingEventArgs = {
            newValue,
            oldValue,
            newSelection,
            oldSelection,
            added,
            removed,
            event,
            owner: this,
            displayText,
            cancel: false
        };
        this.selectionChanging.emit(args);
        if (!args.cancel) {
            this.selectionService.select_items(this.id, args.newValue, true);
            this._value = args.newValue;
            if (displayText !== args.displayText) {
                this._displayValue = this._displayText = args.displayText;
            } else {
                this._displayValue = this.createDisplayText(this.selection, args.oldSelection);
            }
            this._onChangeCallback(args.newValue);
        } else if (this.isRemote) {
            this.registerRemoteEntries(diffInSets(selection, currentSelection), false);
        }
    }

    protected createDisplayText(newSelection: any[], oldSelection: any[]) {
        const selection = this.valueKey ? newSelection.map(item => item[this.valueKey]) : newSelection;
        return this.isRemote
            ? this.getRemoteSelection(selection, oldSelection)
            : this.concatDisplayText(newSelection);
    }

    protected getSearchPlaceholderText(): string {
        return this.searchPlaceholder ||
            (this.disableFiltering ? this.resourceStrings.igx_combo_addCustomValues_placeholder : this.resourceStrings.igx_combo_filter_search_placeholder);
    }

    /** Returns a string that should be populated in the combo's text box */
    private concatDisplayText(selection: any[]): string {
        const value = this.displayKey !== null && this.displayKey !== undefined ?
            selection.map(entry => entry[this.displayKey]).join(', ') :
            selection.join(', ');
        return value;
    }
}
