import { IDropDownBase, IGX_DROPDOWN_BASE } from './drop-down.common';
import { Directive, Input, HostBinding, HostListener, ElementRef, Output, EventEmitter, booleanAttribute, DoCheck, inject } from '@angular/core';
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
    standalone: true
})
export class IgxDropDownItemBaseDirective implements DoCheck {
    protected dropDown = inject<IDropDownBase>(IGX_DROPDOWN_BASE);
    protected elementRef = inject(ElementRef);
    protected group = inject(IgxDropDownGroupComponent, { optional: true });
    protected selection? = inject<IgxSelectionAPIService>(IgxSelectionAPIService, { optional: true });

    /**
     * Sets/gets the `id` of the item.
     *
     * @memberof IgxSelectItemComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-drop-down-item-${NEXT_ID++}`;

    @HostBinding('attr.aria-label')
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
     */
    @Input()
    public value: any;

    /**
     * @hidden @internal
     */
    @HostBinding('class.igx-drop-down__item')
    public get itemStyle(): boolean {
        return !this.isHeader;
    }

    /**
     * Sets/Gets if the item is the currently selected one in the dropdown
     *
     * Two-way data binding
     */
    @Input({ transform: booleanAttribute })
    @HostBinding('attr.aria-selected')
    @HostBinding('class.igx-drop-down__item--selected')
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
     */
    @HostBinding('class.igx-drop-down__item--focused')
    public get focused(): boolean {
        return this.isSelectable && this._focused;
    }

    /**
     */
    public set focused(value: boolean) {
        this._focused = value;
    }

    /**
     * Sets/gets if the given item is header
     */
    @Input({ transform: booleanAttribute })
    @HostBinding('class.igx-drop-down__header')
    public isHeader: boolean;

    /**
     * Sets/gets if the given item is disabled
     *
     * **NOTE:** Drop-down items inside of a disabled `IgxDropDownGroup` will always count as disabled
     */
    @Input({ transform: booleanAttribute })
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
     */
    @Input()
    @HostBinding('attr.role')
    public role = 'option';

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
    protected _focused = false;
    protected _selected = false;
    protected _index = null;
    protected _disabled = false;
    protected _label = null;

    /**
     * @hidden
     * @internal
     */
    @HostListener('click', ['$event'])
    public clicked(event): void { // eslint-disable-line
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('mousedown', ['$event'])
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
