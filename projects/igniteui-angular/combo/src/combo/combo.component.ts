import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    Input,
    Output,
    EventEmitter,
    HostListener,
    DoCheck,
    booleanAttribute,
    ChangeDetectionStrategy,
    ViewEncapsulation
} from '@angular/core';

import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import {
    IBaseEventArgs,
    IBaseCancelableEventArgs,
    CancelableEventArgs,
    EditorProvider
} from 'igniteui-angular/core';
import { IgxVirtualItemDirective, IgxVirtualScrollComponent } from 'igniteui-angular/virtual-scroll';
import { IgxRippleDirective } from 'igniteui-angular/directives';
import { IgxButtonDirective } from 'igniteui-angular/directives';
import { IgxComboItemComponent } from './combo-item.component';
import { IgxComboDropDownComponent } from './combo-dropdown.component';
import { IgxComboDataWindowPipe, IgxComboFilteringPipe, IgxComboGroupingPipe, IgxComboRecordWindowPipe } from './combo.pipes';
import { COMBO_SELECT_ALL_RECORD, ComboToggleState, IGX_COMBO_COMPONENT, IgxComboBaseDirective } from './combo.common';
import { IgxComboAddItemComponent } from './combo-add-item.component';
import { IgxComboAPIService } from './combo.api';
import { IgxInputGroupComponent, IgxInputDirective, IgxReadOnlyInputDirective, IgxSuffixDirective } from 'igniteui-angular/input-group';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxDropDownItemNavigationDirective } from 'igniteui-angular/drop-down';

/** Event emitted when the Combo's selection has changed */
export interface IComboSelectionChangedEventArgs extends IBaseEventArgs {
    /** An array containing the old selection values */
    oldValue: any[];
    /** An array containing the new selection items */
    newValue: any[];
    /** An array containing the old selection items */
    oldSelection: any[];
    /** An array containing the new selection items */
    newSelection: any[];
    /** An array containing the items added to the selection (if any) */
    added: any[];
    /** An array containing the items removed from the selection (if any) */
    removed: any[];
    /** The display text of the combo text box */
    displayText: string;
    /** The user interaction that triggered the selection change */
    event?: Event;
}

/** Event emitted when the Combo's selection is changing */
export interface IComboSelectionChangingEventArgs extends IComboSelectionChangedEventArgs, IBaseCancelableEventArgs {}

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
/** How many of the items of a toggle option there are, and how many are selected. */
interface ToggleCount {
    total: number;
    selected: number;
}

/** The counts of the toggle options, and what they were counted from. */
interface ToggleCounts {
    items: any[];
    selection: Set<any> | undefined;
    valueKey: string;
    groupKey: string;
    all: ToggleCount;
    groups: Map<string, ToggleCount>;
}

const diffInSets = (set1: Set<any>, set2: Set<any>): any[] => {
    const results: any[] = [];
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
    styleUrl: 'combo.component.css',
    encapsulation: ViewEncapsulation.None,
    providers: [
        IgxComboAPIService,
        { provide: IGX_COMBO_COMPONENT, useExisting: IgxComboComponent },
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxComboComponent, multi: true }
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        NgTemplateOutlet,
        NgClass,
        FormsModule,
        IgxInputGroupComponent,
        IgxInputDirective,
        IgxSuffixDirective,
        IgxIconComponent,
        IgxComboDropDownComponent,
        IgxDropDownItemNavigationDirective,
        IgxVirtualScrollComponent,
        IgxVirtualItemDirective,
        IgxComboItemComponent,
        IgxComboAddItemComponent,
        IgxButtonDirective,
        IgxRippleDirective,
        IgxReadOnlyInputDirective,
        IgxComboFilteringPipe,
        IgxComboGroupingPipe,
        IgxComboDataWindowPipe,
        IgxComboRecordWindowPipe
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
    public searchPlaceholder!: string;

    /**
     * Shows a "Select all" option as the first row of the list. It selects the items that
     * the list shows, or deselects them when all of them are selected, with one
     * `selectionChanging` event. Its checkbox is indeterminate while only some of them are
     * selected. The list shows it only while it shows items. With `totalItemCount`, it acts
     * on the loaded items.
     *
     * @param value `true` to show the "Select all" option. Default is `false`.
     * @returns Whether the list shows the "Select all" option when it shows items.
     * @example
     * ```html
     * <igx-combo [showSelectAll]="true"></igx-combo>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get showSelectAll(): boolean {
        return this._showSelectAll;
    }
    public set showSelectAll(value: boolean) {
        if (this._showSelectAll !== value) {
            this._showSelectAll = value;
            // The rows move, so the active row would name another option.
            this.clearActiveOption();
        }
    }

    /**
     * Makes each group header an option that selects the items of its group that the list
     * shows, or deselects them when all of them are selected, with one `selectionChanging`
     * event. Its checkbox is indeterminate while only some of them are selected. The items
     * are indented under their header. Needs `groupKey`. A group is not part of the selection.
     *
     * @param value `true` to make the group headers options. Default is `false`.
     * @returns Whether the group headers are options when `groupKey` is set.
     * @example
     * ```html
     * <igx-combo groupKey="region" [groupSelection]="true"></igx-combo>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get groupSelection(): boolean {
        return this._groupSelection;
    }
    public set groupSelection(value: boolean) {
        if (this._groupSelection !== value) {
            this._groupSelection = value;
            // A header that stops being an option cannot stay active.
            this.clearActiveOption();
        }
    }

    /**
     * Emitted when item selection is changing, before the selection completes
     *
     * ```html
     * <igx-combo (selectionChanging)='handleSelection()'></igx-combo>
     * ```
     */
    @Output()
    public selectionChanging = new EventEmitter<IComboSelectionChangingEventArgs>();

    /**
     * Emitted when item selection is changed, after the selection completes
     *
     * ```html
     * <igx-combo (selectionChanged)='handleSelection()'></igx-combo>
     * ```
     */
    @Output()
    public selectionChanged = new EventEmitter<IComboSelectionChangedEventArgs>();

    /** @hidden @internal */
    @ViewChild(IgxComboDropDownComponent, { static: true })
    public dropdown!: IgxComboDropDownComponent;

    /** @hidden @internal */
    public get filteredData(): any[] | null {
        return this.disableFiltering ? this.data : this._filteredData;
    }
    /** @hidden @internal */
    public set filteredData(val: any[] | null) {
        this._filteredData = this.groupKey ? (val || []).filter((e) => e.isHeader !== true) : val!;
        this.checkMatch();
    }

    protected _prevInputValue = '';

    private _displayText!: string;
    private _showSelectAll = false;
    private _groupSelection = false;
    private _toggleCounts: ToggleCounts | null = null;

    constructor() {
        super();
        this.comboAPI.register(this);
    }

    @HostListener('keydown.ArrowDown', ['$event'])
    @HostListener('keydown.Alt.ArrowDown', ['$event'])
    public onArrowDown(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.open();
    }

    @HostListener('keydown.Escape', ['$event'])
    public onEscape(event: Event) {
        event.stopPropagation();
        if (this.collapsed) {
            this.deselectAllItems(true, event);
        }
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
    public writeValue(value: any[]): void {
        const selection = Array.isArray(value) ? value.filter(x => x !== undefined) : [];
        const oldSelection = this.selection;
        this.selectionService.select_items(this.selectionKey, selection, true);
        this.cdr.markForCheck();
        this._displayValue = this.createDisplayText(this.selection, oldSelection);
        this._value = this.valueKey ? this.selection.map(item => item[this.valueKey]) : this.selection;
    }

    /** @hidden @internal */
    public ngDoCheck(): void {
        if (!this.data?.length) {
            return;
        }
        const selection = this.selection;
        if (selection.length) {
            this._displayValue = this._displayText || this.createDisplayText(selection, []);
            this._value = this.valueKey ? selection.map(item => item[this.valueKey]) : selection;
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
            const newSelection = this.selectionService.add_items(this.selectionKey, newItems, clearCurrentSelection);
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
            const newSelection = this.selectionService.delete_items(this.selectionKey, items);
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
        const newSelection = this.selectionService.add_items(this.selectionKey, allVisible);
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
        if (this.filteredData!.length !== this.data!.length && !ignoreFilter) {
            newSelection = this.selectionService.delete_items(this.selectionKey, this.selectionService.get_all_ids(this.filteredData, this.valueKey));
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

    /**
     * @hidden @internal
     * The record of the "Select all" option. The template compares rows with it, because a
     * data record can have a field of the same name.
     */
    protected readonly selectAllRecord = COMBO_SELECT_ALL_RECORD;

    /** @hidden @internal Whether the group headers are options. See `groupSelection`. */
    protected get selectableGroups(): boolean {
        const groupKey: unknown = this.groupKey;
        return this.groupSelection && (!!groupKey || groupKey === 0);
    }

    /**
     * @hidden @internal
     * Whether the list starts with the "Select all" option. With remote records, the row stays
     * while a page loads, so emptied data does not move the records to other rows.
     */
    protected get hasSelectAllRow(): boolean {
        return this.showSelectAll && (this.totalItemCount > 0 || !!this.filteredData?.length);
    }

    /**
     * @hidden @internal
     * Whether the record is the "Select all" option, or a group header option while
     * `groupSelection` applies.
     *
     * @param record The record of a row in the list.
     * @returns `true` for a toggle option.
     * @example
     * ```typescript
     * const isToggle = this.combo.isToggleRecord(item.value);
     * ```
     */
    public override isToggleRecord(record: any): boolean {
        return record === COMBO_SELECT_ALL_RECORD || (!!record?.isHeader && this.selectableGroups);
    }

    /**
     * @hidden @internal
     * Whether all, some or none of the shown items of a toggle option are selected.
     *
     * @param record The record of the "Select all" option or of a group header option.
     * @returns `'all'`, `'some'` or `'none'`.
     * @example
     * ```typescript
     * const checked = this.combo.toggleRecordState(item.value) === 'all';
     * ```
     */
    public override toggleRecordState(record: any): ComboToggleState {
        const counts = this.getToggleCounts();
        const count = record === COMBO_SELECT_ALL_RECORD
            ? counts.all
            : counts.groups.get(this.groupOf(record));

        if (!count?.selected) {
            return 'none';
        }
        return count.selected === count.total ? 'all' : 'some';
    }

    /**
     * @hidden @internal
     * Selects the shown items of a toggle option, or deselects them when all of them are
     * selected, with one `selectionChanging` event.
     *
     * @param record The record of the "Select all" option or of a group header option.
     * @param event The user interaction that toggles the option, if any.
     * @returns Nothing.
     * @example
     * ```typescript
     * this.combo.toggleRecord(item.value, event);
     * ```
     */
    public override toggleRecord(record: any, event?: Event): void {
        const shown = this.filteredData ?? [];
        const items = record === COMBO_SELECT_ALL_RECORD
            ? shown
            : shown.filter(item => this.groupOf(item) === this.groupOf(record));

        if (!items.length) {
            return;
        }

        const keys = this.selectionService.get_all_ids(items, this.valueKey);
        if (this.toggleRecordState(record) === 'all') {
            this.deselect(keys, event);
        } else {
            this.select(keys, false, event);
        }
    }

    /** @hidden @internal One row before the records for the "Select all" option. */
    protected override get leadingRowCount(): number {
        return this.hasSelectAllRow ? 1 : 0;
    }

    /** The group of an item or a group header, as the grouping names it. */
    private groupOf(record: any): string {
        return String(record?.[this.groupKey] ?? 'Other');
    }

    /**
     * How many of the shown items are selected, in all and in each group. The rows read it
     * on each check, so it is counted again only for new shown items or a new selection.
     */
    private getToggleCounts(): ToggleCounts {
        const items = this.filteredData ?? [];
        const selection = this.selectionService.get(this.selectionKey);
        const cached = this._toggleCounts;

        if (cached && cached.items === items && cached.selection === selection &&
            cached.valueKey === this.valueKey && cached.groupKey === this.groupKey) {
            return cached;
        }

        // A valueKey of 0 still names a field, as in the selection service.
        const valueKey = this.valueKey;
        const hasValueKey = valueKey !== null && valueKey !== undefined;
        const all: ToggleCount = { total: 0, selected: 0 };
        const groups = new Map<string, ToggleCount>();
        for (const item of items) {
            const selected = !!selection?.has(hasValueKey ? item?.[valueKey] : item);
            const group = this.groupOf(item);
            const count = groups.get(group) ?? { total: 0, selected: 0 };

            count.total++;
            all.total++;
            if (selected) {
                count.selected++;
                all.selected++;
            }
            groups.set(group, count);
        }

        this._toggleCounts = { items, selection, valueKey: this.valueKey, groupKey: this.groupKey, all, groups };
        return this._toggleCounts;
    }

    /** Leaves the open list without an active option. */
    private clearActiveOption(): void {
        if (this.dropdown && !this.dropdown.collapsed && this.dropdown.focusedItem) {
            this.dropdown.focusedItem = null;
            this.setActiveDescendant();
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
        const currentSelection = this.selectionService.get(this.selectionKey);
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
            this.selectionService.select_items(this.selectionKey, args.newValue, true);
            this._value = args.newValue;
            if (displayText !== args.displayText) {
                this._displayValue = this._displayText = args.displayText;
            } else {
                this._displayValue = this.createDisplayText(this.selection, args.oldSelection);
            }
            this._onChangeCallback(this.value);
            const changedArgs: IComboSelectionChangedEventArgs = {
                newValue: this.value,
                oldValue,
                newSelection: this.selection,
                oldSelection,
                added: this.convertKeysToItems(diffInSets(new Set(this.value), new Set(oldValue))),
                removed: this.convertKeysToItems(diffInSets(new Set(oldValue), new Set(this.value))),
                event,
                owner: this,
                displayText: this._displayValue
            };
            this.selectionChanged.emit(changedArgs);
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
            (this.disableFiltering ? this.resourceStrings.igx_combo_addCustomValues_placeholder : this.resourceStrings.igx_combo_filter_search_placeholder)!;
    }

    /** Returns a string that should be populated in the combo's text box */
    private concatDisplayText(selection: any[]): string {
        const value = this.displayKey !== null && this.displayKey !== undefined ?
            selection.map(entry => entry[this.displayKey]).join(', ') :
            selection.join(', ');
        return value;
    }
}
