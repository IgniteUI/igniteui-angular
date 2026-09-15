import { IDropDownBase, IGX_DROPDOWN_BASE } from './drop-down.common';
import { Directive, Input, ElementRef, Output, EventEmitter, booleanAttribute, DoCheck, inject, signal } from '@angular/core';
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
        return this._idState();
    }
    public set id(value: string) {
        this._idState.set(value);
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
        return this._valueState();
    }
    public set value(value: any) {
        this._valueState.set(value);
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
        if (this.isHeader) {
            return;
        }
        this._selected = value;
        this.selectedChange.emit(this._selected);
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
        return this._isHeaderState();
    }
    public set isHeader(value: boolean) {
        this._isHeaderState.set(value);
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
        return this._roleState();
    }
    public set role(value: string) {
        this._roleState.set(value);
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
    private readonly _focusedState = signal(false);
    private readonly _selectedState = signal(false);
    private readonly _disabledState = signal(false);
    private readonly _valueState = signal<any>(undefined);

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
    protected get _disabled(): boolean {
        return this._disabledState();
    }
    protected set _disabled(value: boolean) {
        this._disabledState.set(value);
    }
    private readonly _idState = signal(`igx-drop-down-item-${NEXT_ID++}`);
    private readonly _isHeaderState = signal<boolean>(undefined!);
    private readonly _roleState = signal('option');
    private readonly _indexState = signal<number | null>(null);
    private readonly _labelState = signal<string | null>(null);

    protected get _index(): number | null {
        return this._indexState();
    }
    protected set _index(value: number | null) {
        this._indexState.set(value);
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
        if (this._selected) {
            const dropDownSelectedItem = this.dropDown.selectedItem;
            if (!dropDownSelectedItem) {
                this.dropDown.selectItem(this, undefined, false);
            } else if (this.hasIndex
                ? this._index !== dropDownSelectedItem.index || this.value !== dropDownSelectedItem.value :
                this !== dropDownSelectedItem) {
                this.dropDown.selectItem(this, undefined, false);
            }
        }
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
