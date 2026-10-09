import { IDropDownBase, IGX_DROPDOWN_BASE } from './drop-down.common';
import { AfterRenderRef, Directive, Input, ElementRef, Output, EventEmitter, Injector, afterEveryRender, booleanAttribute, DoCheck, inject, signal, untracked } from '@angular/core';
import { IgxSelectionAPIService } from 'igniteui-angular/core';
import { IgxDropDownGroupComponent } from './drop-down-group.component';

let NEXT_ID = 0;

/**
 * An abstract class defining a drop-down item:
 * With properties / styles for selection, highlight, height
 * Bindable property for passing data (`value: any`)
 * Parent component (has to be used under a parent with type `IDropDownBase`)
 * Method for handling click on Host()
 */
@Directive({
    selector: '[igxDropDownItemBase]',
    host: {
        '[attr.id]': 'id',
        '[attr.aria-label]': 'ariaLabel',
        '[attr.aria-selected]': 'selected',
        '[attr.aria-disabled]': 'disabled',
        '[attr.role]': 'role',
        '[class.igx-drop-down__item]': 'itemStyle',
        '[class.igx-drop-down__item--selected]': 'selected',
        '[class.igx-drop-down__item--focused]': 'focused',
        '[class.igx-drop-down__header]': 'isHeader',
        '[class.igx-drop-down__item--disabled]': 'disabled',
        '(click)': 'clicked($event)',
        '(mousedown)': 'handleMousedown($event)'
    }
})
export class IgxDropDownItemBaseDirective implements DoCheck {
    protected dropDown = inject<IDropDownBase>(IGX_DROPDOWN_BASE);
    protected elementRef = inject(ElementRef);
    protected group = inject(IgxDropDownGroupComponent, { optional: true });
    protected selection? = inject<IgxSelectionAPIService>(IgxSelectionAPIService, { optional: true });
    private readonly _id = signal(`igx-drop-down-item-${NEXT_ID++}`);
    private readonly _value = signal<any>(undefined);
    private readonly _isHeader = signal<boolean>(undefined!);
    private readonly _role = signal('option');
    private readonly _focusedState = signal(false);
    private readonly _selectedState = signal(false);
    private readonly _indexState = signal<number | null>(null);
    private readonly _disabledState = signal(false);
    private readonly _labelState = signal<string | null>(null);
    private readonly _injector = inject(Injector);
    /** Whether `selected` was set when the item was last checked, so a check can tell it was just set. */
    private _selectedWhenChecked = false;
    /** Whether the item yielded the selection since its re-check last ran. */
    private _recheckDue = false;
    /** The write hook, registered when the item first yields, that decides again whether it still yields. */
    private _yieldRecheck: AfterRenderRef | null = null;

    /**
     * Sets/gets the `id` of the item.
     * ```html
     * <igx-drop-down-item [id] = 'igx-drop-down-item-0'></igx-drop-down-item>
     * ```
     * ```typescript
     * let itemId =  this.item.id;
     * ```
     *
     * @memberof IgxSelectItemComponent
     */
    @Input()
    public get id(): string {
        return this._id();
    }
    public set id(value: string) {
        this._id.set(value);
    }

    @Input()
    public get ariaLabel(): string | null{
        return this._label ? this._label : this.value ? this.value : null;
    }

    public set ariaLabel(value: string | null) {
        this._label = value;
    }

    /**
     * @hidden @internal
     */
    public get itemID() {
        return this;
    }

    /**
     * The data index of the dropdown item.
     *
     * ```typescript
     * // get the data index of the selected dropdown item
     * let selectedItemIndex = this.dropdown.selectedItem.index
     * ```
     */
    @Input()
    public get index(): number {
        if (this._index === null) {
            return this.itemIndex;
        }
        return this._index;
    }

    public set index(value) {
        this._index = value;
    }

    /**
     * Gets/sets the value of the item if the item is databound
     *
     * ```typescript
     * // usage in IgxDropDownItemComponent
     * // get
     * let mySelectedItemValue = this.dropdown.selectedItem.value;
     *
     * // set
     * let mySelectedItem = this.dropdown.selectedItem;
     * mySelectedItem.value = { id: 123, name: 'Example Name' }
     *
     * // usage in IgxComboItemComponent
     * // get
     * let myComboItemValue = this.combo.items[0].value;
     * ```
     */
    @Input()
    public get value(): any {
        return this._value();
    }
    public set value(value: any) {
        this._value.set(value);
    }

    /**
     * @hidden @internal
     */
    public get itemStyle(): boolean {
        return !this.isHeader;
    }

    /**
     * Sets/Gets if the item is the currently selected one in the dropdown
     *
     * ```typescript
     *  let mySelectedItem = this.dropdown.selectedItem;
     *  let isMyItemSelected = mySelectedItem.selected; // true
     * ```
     *
     * Two-way data binding
     * ```html
     * <igx-drop-down-item [(selected)]='model.isSelected'></igx-drop-down-item>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get selected(): boolean {
        return this._selected;
    }

    public set selected(value: boolean) {
        // Untracked, so an effect that sets it does not depend on the state it writes.
        untracked(() => {
            if (this.isHeader) {
                return;
            }
            this._selected = value;
            this.selectedChange.emit(this._selected);
        });
    }

    /**
     * @hidden
     */
    @Output()
    public selectedChange = new EventEmitter<boolean>();

    /**
     * Sets/gets if the given item is focused
     * ```typescript
     *  let mySelectedItem = this.dropdown.selectedItem;
     *  let isMyItemFocused = mySelectedItem.focused;
     * ```
     */
    public get focused(): boolean {
        return this.isSelectable && this._focused;
    }

    /**
     * ```html
     *  <igx-drop-down-item *ngFor="let item of items" focused={{!item.focused}}>
     *      <div>
     *          {{item.field}}
     *      </div>
     *  </igx-drop-down-item>
     * ```
     */
    public set focused(value: boolean) {
        this._focused = value;
    }

    /**
     * Sets/gets if the given item is header
     * ```typescript
     *  // get
     *  let mySelectedItem = this.dropdown.selectedItem;
     *  let isMyItemHeader = mySelectedItem.isHeader;
     * ```
     *
     * ```html
     *  <!--set-->
     *  <igx-drop-down-item *ngFor="let item of items">
     *      <div *ngIf="items.indexOf(item) === 5; then item.isHeader = true">
     *          {{item.field}}
     *      </div>
     *  </igx-drop-down-item>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public get isHeader(): boolean {
        return this._isHeader();
    }
    public set isHeader(value: boolean) {
        this._isHeader.set(value);
    }

    /**
     * Sets/gets if the given item is disabled
     *
     * ```typescript
     *  // get
     *  let mySelectedItem = this.dropdown.selectedItem;
     *  let myItemIsDisabled = mySelectedItem.disabled;
     * ```
     *
     * ```html
     *  <igx-drop-down-item *ngFor="let item of items" disabled={{!item.disabled}}>
     *      <div>
     *          {{item.field}}
     *      </div>
     *  </igx-drop-down-item>
     * ```
     * **NOTE:** Drop-down items inside of a disabled drop down group will always count as disabled
     */
    @Input({ transform: booleanAttribute })
    public get disabled(): boolean {
        return this.group ? this.group.disabled || this._disabled : this._disabled;
    }

    public set disabled(value: boolean) {
        this._disabled = value;
    }

    /**
     * Gets/sets the `role` attribute of the item. Default is 'option'.
     *
     * ```html
     *  <igx-drop-down-item [role]="customRole"></igx-drop-down-item>
     * ```
     */
    @Input()
    public get role(): string {
        return this._role();
    }
    public set role(value: string) {
        this._role.set(value);
    }

    /**
     * Gets item index
     *
     * @hidden @internal
     */
    public get itemIndex(): number {
        return this.dropDown.items.indexOf(this);
    }

    /**
     * Gets item element height
     *
     * @hidden @internal
     */
    public get elementHeight(): number {
        return this.elementRef.nativeElement.clientHeight;
    }

    /**
     * Get item html element
     *
     * @hidden @internal
     */
    public get element(): ElementRef {
        return this.elementRef;
    }

    protected get hasIndex(): boolean {
        return this._index !== null && this._index !== undefined;
    }

    /**
     * @hidden
     */
    protected get _focused(): boolean {
        return this._focusedState();
    }
    protected set _focused(value: boolean) {
        this._focusedState.set(value);
    }
    protected get _selected(): boolean {
        return this._selectedState();
    }
    protected set _selected(value: boolean) {
        this._selectedState.set(value);
    }
    protected get _index(): number | null {
        return this._indexState();
    }
    protected set _index(value: number | null) {
        this._indexState.set(value);
    }
    protected get _disabled(): boolean {
        return this._disabledState();
    }
    protected set _disabled(value: boolean) {
        this._disabledState.set(value);
    }
    protected get _label(): string | null {
        return this._labelState();
    }
    protected set _label(value: string | null) {
        this._labelState.set(value);
    }

    /**
     * @hidden
     * @internal
     */
    public clicked(_event: MouseEvent): void { }

    /**
     * @hidden
     * @internal
     */
    public handleMousedown(event: MouseEvent): void {
        if (!this.dropDown.allowItemsFocus) {
            event.preventDefault();
        }
    }

    public ngDoCheck(): void {
        const selected = this._selected;
        const turnedOn = selected && !this._selectedWhenChecked;
        this._selectedWhenChecked = selected;
        if (!selected || this.holdsSelection()) {
            return;
        }
        // An item whose `selected` stays set takes the selection back, unless it yields it to another
        // one. A virtualized drop-down does not clear it on the row it deselects, so two such rows
        // would take the selection from each other on every check.
        if (turnedOn || !this.yieldsSelection()) {
            this.dropDown.selectItem(this, undefined, false);
        } else if (this.dropDown.items.includes(this)) {
            // The re-check would yield again for an item the list misses.
            this.recheckYield();
        }
    }

    /** Whether the drop-down's selection is this item or, for an item with a data index, its index and value. */
    private holdsSelection(): boolean {
        const selectedItem = this.dropDown.selectedItem;
        return !!selectedItem && (this.hasIndex
            ? this._index === selectedItem.index && this.value === selectedItem.value
            : this === selectedItem);
    }

    /**
     * Decides again, once the rows are checked, whether the item yields the selection. In its check,
     * later rows may still have had their old inputs, so it may have yielded to a flag the same change
     * clears or to a row it removes. The item registers one write hook for this, and later checks only
     * mark it due: a hook registered in a check that an after-render hook runs adds a render round, so
     * a hook that checks the rows on every render would never settle, and a once hook registered after
     * the write phase is dropped without running.
     */
    private recheckYield(): void {
        this._recheckDue = true;
        this._yieldRecheck ??= afterEveryRender({
            write: () => {
                if (!this._recheckDue) {
                    return;
                }
                this._recheckDue = false;
                if (this._selected && !this.holdsSelection() && !this.yieldsSelection()) {
                    this.dropDown.selectItem(this, undefined, false);
                }
            }
        }, { injector: this._injector });
    }

    /**
     * Whether an item whose `selected` stays set leaves the selection to another one, so that only the
     * last such item in display order takes it back. Two items with different data indexes rank by
     * them: a virtualized drop-down needs them on its rows, and once it recycles the rows, its item list
     * no longer follows the display order. Any other two rank by their position in the item list, so of
     * any two such items, one leaves the selection to the other. Items that all bind a data index, or
     * none of which does, settle on one; mixed, they can rank in a cycle, and then each of them leaves
     * the selection where it is. An item the list misses leaves it too: it took the selection when its
     * `selected` was set, and the list collects it only once the view that declares it is checked, or
     * never if another component renders it. Rows that another component renders therefore take the
     * selection only when their `selected` is set, and it stays where the last of them, or a pick, put
     * it, unless an item in the list with `selected` set takes it back.
     */
    private yieldsSelection(): boolean {
        const items = this.dropDown.items;
        const position = items.indexOf(this);
        if (position === -1) {
            return true;
        }
        return items.some((item, i) => item._selected
            && (this.hasIndex && item.hasIndex && item._index !== this._index
                ? item._index! > this._index!
                : i > position));
    }

    /** Returns true if the items is not a header or disabled  */
    protected get isSelectable(): boolean {
        return !(this.disabled || this.isHeader);
    }

    /** If `allowItemsFocus` is enabled, keep the browser focus on the active item */
    protected ensureItemFocus() {
        if (this.dropDown.allowItemsFocus) {
            const focusedItem = this.dropDown.items.find((item) => item.focused);
            if (!focusedItem) {
                return;
            }
            focusedItem.element.nativeElement.focus({ preventScroll: true });
        }
    }
}
