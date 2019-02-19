import { IDropDownBase, IGX_DROPDOWN_BASE } from './drop-down.common';
import { Input, HostBinding, HostListener, ElementRef, Optional, Inject, DoCheck } from '@angular/core';
import { IgxSelectionAPIService } from '../core/selection';
import { DeprecateProperty, showMessage } from '../core/deprecateDecorators';
import { IgxDropDownGroupComponent } from './drop-down-group.component';

let NEXT_ID = 0;
let warningShown = false;

/**
 * An abstract class defining a drop-down item:
 * With properties / styles for selection, highlight, height
 * Bindable property for passing data (`value: any`)
 * Parent component (has to be used under a parent with type `IDropDownBase`)
 * Method for handling click on Host()
 */
export abstract class IgxDropDownItemBase implements DoCheck {
    /**
     * @hidden
     */
    protected _isFocused = false;
    protected _isSelected = false;
    protected _index = null;
    protected _disabled = false;

    /**
     * Sets/gets the `id` of the item.
     * ```html
     * <igx-select-item [id] = 'select-item-0'></igx-select-item>
     * ```
     * ```typescript
     * let itemId =  this.item.id;
     * ```
     * @memberof IgxSelectItemComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-drop-down-item-${NEXT_ID++}`;

    /**
     * @hidden
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
            warningShown = showMessage(
                'IgxDropDownItemBase: Automatic index is deprecated.' +
                'Bind in the template instead using `<igx-drop-down-item [index]="i"` instead.`',
                warningShown);
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
    public value: any;

    /**
     * @hidden
     */
    @HostBinding('class.igx-drop-down__item')
    get itemStyle(): boolean {
        return !this.isHeader;
    }

    /**
     * Sets/Gets if the item is the currently selected one in the dropdown
     *
     * ```typescript
     *  let mySelectedItem = this.dropdown.selectedItem;
     *  let isMyItemSelected = mySelectedItem.selected; // true
     * ```
     */
    @Input()
    @HostBinding('attr.aria-selected')
    @HostBinding('class.igx-drop-down__item--selected')
    get selected(): boolean {
        return this._isSelected;
    }

    set selected(value: boolean) {
        if (this.isHeader) {
            return;
        }
        this._isSelected = value;
    }

    /**
     * @hidden
     */
    @Input()
    @DeprecateProperty(`IgxDropDownItemBase \`isSelected\` property is deprecated.\n` +
        `Use \`selected\` instead.`)
    get isSelected(): boolean {
        return this.selected;
    }

    /**
     * @hidden
     */
    set isSelected(value: boolean) {
        this.selected = value;
    }

    /**
     * Sets/gets if the given item is focused
     * ```typescript
     *  let mySelectedItem = this.dropdown.selectedItem;
     *  let isMyItemFocused = mySelectedItem.isFocused;
     * ```
     */
    @HostBinding('class.igx-drop-down__item--focused')
    get focused(): boolean {
        return (!this.isHeader && !this.disabled) && this._isFocused;
    }

    /**
     * ```html
     *  <igx-drop-down-item *ngFor="let item of items" isFocused={{!item.isFocused}}>
     *      <div>
     *          {{item.field}}
     *      </div>
     *  </igx-drop-down-item>
     * ```
     */
    set focused(value: boolean) {
        this._isFocused = value;
    }

    /**
     * @hidden
     */
    @DeprecateProperty(`IgxDropDownItemBase \`isFocused\` property is depracated.\n` +
        `Use \`focused\` instead.`)
    get isFocused(): boolean {
        return this.focused;
    }
    /**
     * @hidden
     */
    set isFocused(value: boolean) {
        this.focused = value;
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
     *  <igx-dropdown-item *ngFor="let item of items">
     *      <div *ngIf="items.indexOf(item) === 5; then item.isHeader = true">
     *          {{item.field}}
*           </div>
     *  </igx-drop-down-item>
     * ```
     */
    @Input()
    @HostBinding('class.igx-drop-down__header')
    public isHeader: boolean;

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
     * **NOTE:** Drop-down items inside of a disabled `IgxDropDownGroup` will always count as disabled
     */
    @Input()
    @HostBinding('attr.aria-disabled')
    @HostBinding('class.igx-drop-down__item--disabled')
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
    @HostBinding('attr.role')
    public role = 'option';

    /**
     * Gets item index
     * @hidden @internal
     */
    public get itemIndex(): number {
        return this.dropDown.items.indexOf(this);
    }

    /**
     * Gets item element height
     * @hidden
     */
    public get elementHeight(): number {
        return this.elementRef.nativeElement.clientHeight;
    }

    /**
     * Get item html element
     * @hidden
     */
    public get element(): ElementRef {
        return this.elementRef;
    }

    constructor(
        @Inject(IGX_DROPDOWN_BASE) protected dropDown: IDropDownBase,
        protected elementRef: ElementRef,
        @Optional() protected group: IgxDropDownGroupComponent,
        @Optional() @Inject(IgxSelectionAPIService) protected selection?: IgxSelectionAPIService
    ) { }

    /**
     * @hidden
     */
    @HostListener('click', ['$event'])
    clicked(event) {
    }

    ngDoCheck(): void {
        if (this.selected) {
            const dropDownSelectedItem = this.selection.first_item(this.dropDown.id);
            if (!dropDownSelectedItem || this !== dropDownSelectedItem) {
                this.dropDown.selectItem(this);
            }
        }
    }
}
