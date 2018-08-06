import {
    Component,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    Input,
    DoCheck
} from '@angular/core';
import { IgxDropDownComponent, ISelectionEventArgs } from './drop-down.component';

/**
 * The `<igx-drop-down-item> is a container intended for row items in
 * a `<igx-drop-down>` container.
 */

export class IgxDropDownItemBase {

    /**
     * @hidden
     */
    protected _isFocused = false;

    /**
     * @hidden
     */
    public get itemID() {
        return;
    }

    /**
     * @hidden
     */
    public itemData: any;

    /**
     * @hidden
     */
    @HostBinding('class.igx-drop-down__item')
    get itemStyle(): boolean {
        return !this.isHeader;
    }

    /**
     * Gets if the item is the currently selected one in the dropdown
     *
     * ```typescript
     *  let mySelectedItem = this.dropdown.selectedItem;
     *  let isMyItemSelected = mySelectedItem.isSelected; // true
     * ```
     */
    get isSelected() {
        return this.dropDown.selectedItem === this;
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
    get isFocused() {
        return this._isFocused;
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
        if (this.disabled || this.isHeader) {
            this._isFocused = false;
            return;
        }

        if (value && !this.dropDown.collapsed) {
            this.elementRef.nativeElement.focus({ preventScroll: true });
        }
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
     * @hidden
     */
    @HostBinding('attr.tabindex')
    get setTabIndex() {
        const shouldSetTabIndex = this.dropDown.allowItemsFocus && !(this.disabled || this.isHeader);
        if (shouldSetTabIndex) {
            return 0;
        } else {
            return null;
        }
    }

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
    public get element() {
        return this.elementRef;
    }

    constructor(
        public dropDown: any,
        protected elementRef: ElementRef
    ) { }

    /**
     * @hidden
     */
    @HostListener('click', ['$event'])
    clicked(event) {
        if (this.disabled || this.isHeader) {
            const focusedItem = this.dropDown.items.find((item) => item.isFocused);
            focusedItem.elementRef.nativeElement.focus({ preventScroll: true });
            return;
        }
        this.dropDown.navigateItem(this.index);
        this.dropDown.selectItem(this, event);
    }

    /**
     * @hidden
     */
    markItemSelected() {
        this.dropDown.setSelectedItem(this.index);
        this.dropDown.close();
    }
}

@Component({
    selector: 'igx-drop-down-item',
    templateUrl: 'drop-down-item.component.html'
})
export class IgxDropDownItemComponent extends IgxDropDownItemBase implements DoCheck {
    /**
     * @hidden
     */
    protected _isSelected = false;

    constructor(
        @Inject(forwardRef(() => IgxDropDownComponent)) public dropDown: IgxDropDownComponent,
        protected elementRef: ElementRef
    ) {
        super(dropDown, elementRef);
    }

    /**
     * Sets/Gets if the item is the currently selected one in the dropdown
     *
     * ```typescript
     *  let mySelectedItem = this.dropdown.selectedItem;
     *  let isMyItemSelected = mySelectedItem.isSelected; // true
     * ```
     */
    get isSelected() {
        return this._isSelected;
    }
    @Input()
    set isSelected(value: boolean) {
        if (this.isHeader) {
            return;
        }

        this._isSelected = value;
    }

    ngDoCheck(): void {
        if (this.isSelected) {
            const dropDownSelectedItem = this.dropDown.selectedItem;
            if (!dropDownSelectedItem || this !== dropDownSelectedItem) {
                this.dropDown.selectItem(this);
            }
        }
    }
}
