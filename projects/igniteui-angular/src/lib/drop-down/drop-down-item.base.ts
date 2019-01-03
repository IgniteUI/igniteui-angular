import { IDropDownItem, IDropDownBase, IGX_DROPDOWN_BASE } from './drop-down-utils';
import { Input, HostBinding, HostListener, ElementRef, Optional, Inject, DoCheck } from '@angular/core';
import { IDropDownServiceArgs, IgxDropDownSelectionService } from './drop-down.selection';
/**
 * The `<igx-drop-down-item>` is a container intended for row items in
 * a `<igx-drop-down>` container.
 */
export abstract class IgxDropDownItemBase implements IDropDownItem, DoCheck {
    /**
     * @hidden
     */
    protected _isFocused = false;
    protected _isSelected = false;

    /**
     * @hidden
     */
    public get itemID() {
        return this;
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
     *  let isMyItemSelected = mySelectedItem.isSelected; // true
     * ```
     */
    @Input()
    get isSelected(): boolean {
        return this._isSelected;
    }

    set isSelected(value: boolean) {
        if (this.isHeader || this.disabled) {
            return;
        }
        this._isSelected = value;
    }

    /**
     * @hidden
     */
    @HostBinding('attr.aria-selected')
    @HostBinding('class.igx-drop-down__item--selected')
    get selectedStyle(): boolean {
        return this.isSelected;
    }

    /**
     * Sets/gets if the given item is focused
     * ```typescript
     *  let mySelectedItem = this.dropdown.selectedItem;
     *  let isMyItemFocused = mySelectedItem.isFocused;
     * ```
     */
    @HostBinding('class.igx-drop-down__item--focused')
    get isFocused(): boolean {
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
    set isFocused(value: boolean) {
        this._isFocused = value;
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
    public isHeader = false;

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
     */
    @Input()
    @HostBinding('class.igx-drop-down__item--disabled')
    public disabled = false;

    /**
     * Gets item index
     * @hidden
     */
    public get index(): number {
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
        @Optional() @Inject(IgxDropDownSelectionService) protected selection?: IgxDropDownSelectionService
    ) { }

    /**
     * @hidden
     */
    @HostListener('click', ['$event'])
    clicked(event) {
    }

    ngDoCheck(): void {
        if (this.isSelected) {
            const dropDownSelectedItem = this.selection.first_item(this.dropDown.id);
            if (!dropDownSelectedItem || this !== dropDownSelectedItem) {
                this.selection.select_item(this.dropDown.id, this.itemID);
            }
        }
    }
}
