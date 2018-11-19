import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    NgModule,
    OnInit,
    Output,
    QueryList,
    ViewChild,
    Self,
    Optional,
    HostListener,
    Directive,
    Inject,
    HostBinding
} from '@angular/core';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxToggleDirective, IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxDropDownItemComponent, IgxDropDownItemBase } from './drop-down-item.component';
import { OverlaySettings } from '../services';
import { IToggleView } from '../core/navigation';
import { IgxComboDropDownComponent } from '../combo/combo-dropdown.component';
import { CancelableEventArgs } from '../core/utils';

let NEXT_ID = 0;

/**
 * Interface that encapsulates onSelection event arguments - old selection, new selection and cancel selection.
 *
 * @export
 */
export interface ISelectionEventArgs extends CancelableEventArgs {
    oldSelection: IgxDropDownItemBase;
    newSelection: IgxDropDownItemBase;
}

/** @hidden */
export enum Navigate {
    Up = -1,
    Down = 1
}


export class IgxDropDownBase implements OnInit, IToggleView {
    private _initiallySelectedItem: IgxDropDownItemComponent = null;
    protected _focusedItem: any = null;
    private _width;
    private _height;
    private _id = `igx-drop-down-${NEXT_ID++}`;

    @ContentChildren(forwardRef(() => IgxDropDownItemComponent))
    protected children: QueryList<IgxDropDownItemBase>;

    @ViewChild(IgxToggleDirective)
    protected toggleDirective: IgxToggleDirective;

    /**
     * Emitted when item selection is changing, before the selection completes
     *
     * ```html
     * <igx-drop-down (onSelection)='handleSelection()'></igx-drop-down>
     * ```
     */
    @Output()
    public onSelection = new EventEmitter<ISelectionEventArgs>();

    /**
     * Emitted before the dropdown is opened
     *
     * ```html
     * <igx-drop-down (onOpening)='handleOpening()'></igx-drop-down>
     * ```
     */
    @Output()
    public onOpening = new EventEmitter<CancelableEventArgs>();

    /**
     * Emitted after the dropdown is opened
     *
     * ```html
     * <igx-drop-down (onOpened)='handleOpened()'></igx-drop-down>
     * ```
     */
    @Output()
    public onOpened = new EventEmitter();

    /**
     * Emitted before the dropdown is closed
     *
     * ```html
     * <igx-drop-down (onClosing)='handleClosing()'></igx-drop-down>
     * ```
     */
    @Output()
    public onClosing = new EventEmitter<CancelableEventArgs>();

    /**
     * Emitted after the dropdown is closed
     *
     * ```html
     * <igx-drop-down (onClosed)='handleClosed()'></igx-drop-down>
     * ```
     */
    @Output()
    public onClosed = new EventEmitter();

    /**
     *  Gets the width of the drop down
     *
     * ```typescript
     * // get
     * let myDropDownCurrentWidth = this.dropdown.width;
     * ```
     */
    @Input()
    get width() {
        return this._width;
    }
    /**
     * Sets the width of the drop down
     *
     * ```html
     * <!--set-->
     * <igx-drop-down [width]='160px'></igx-drop-down>
     * ```
     */
    set width(value) {
        this._width = value;
        this.toggleDirective.element.style.width = value;
    }

    /**
     * Gets the height of the drop down
     *
     * ```typescript
     * // get
     * let myDropDownCurrentHeight = this.dropdown.height;
     * ```
     */
    @Input()
    get height() {
        return this._height;
    }
    /**
     * Sets the height of the drop down
     *
     * ```html
     * <!--set-->
     * <igx-drop-down [height]='400px'></igx-drop-down>
     * ```
     */
    set height(value) {
        this._height = value;
        this.toggleDirective.element.style.height = value;
    }

    /**
     * Gets/sets whether items take focus. Disabled by default.
     * When enabled, drop down items gain tab index and are focused when active -
     * this includes activating the selected item when opening the drop down and moving with keyboard navigation.
     *
     * Note: Keep that focus shift in mind when using the igxDropDownItemNavigation directive
     * and ensure it's placed either on each focusable item or a common ancestor to allow it to handle keyboard events.
     *
     * ```typescript
     * // get
     * let dropDownAllowsItemFocus = this.dropdown.allowItemsFocus;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-drop-down [allowItemsFocus]='true'></igx-drop-down>
     * ```
     */
    @Input()
    public allowItemsFocus = false;

    /**
     * Gets the drop down's id
     *
     * ```typescript
     * // get
     * let myDropDownCurrentId = this.dropdown.id;
     * ```
     */
    @Input()
    get id(): string {
        return this._id;
    }
    /**
     * Sets the drop down's id
     *
     * ```html
     * <!--set-->
     * <igx-drop-down [id]='newDropDownId'></igx-drop-down>
     * ```
     */
    set id(value: string) {
        this.selection.set(value, this.selection.get(this.id));
        this._id = value;
        this.toggleDirective.id = value;
    }

    @HostBinding('class.igx-drop-down')
    cssClass = 'igx-drop-down';

    /**
     * Gets/Sets the drop down's container max height.
     *
     * ```typescript
     * // get
     * let maxHeight = this.dropdown.maxHeight;
     * ```
     *
     * ```html
     * <!--set-->
     * <igx-drop-down [maxHeight]='200px'></igx-drop-down>
     * ```
     */
    @Input()
    public maxHeight = null;

    /**
     * Gets if the dropdown is collapsed
     *
     * ```typescript
     * let isCollapsed = this.dropdown.collapsed;
     * ```
     */
    public get collapsed(): boolean {
        return this.toggleDirective.collapsed;
    }

    /**
     * Get currently selected item
     *
     * ```typescript
     * let currentItem = this.dropdown.selectedItem;
     * ```
     */
    public get selectedItem(): any {
        const selectedItem = this.selection.first_item(this.id);
        if (selectedItem) {
            if (selectedItem.isSelected) {
                return selectedItem;
            }
            this.selection.clear(this.id);
        }
        return null;
    }

    /**
     * Get all non-header items
     *
     * ```typescript
     * let myDropDownItems = this.dropdown.items;
     * ```
     */
    public get items(): IgxDropDownItemBase[] {
        const items: IgxDropDownItemBase[] = [];
        if (this.children !== undefined) {
            for (const child of this.children.toArray()) {
                if (!child.isHeader) {
                    items.push(child);
                }
            }
        }

        return items;
    }

    /**
     * Get all header items
     *
     * ```typescript
     * let myDropDownHeaderItems = this.dropdown.headers;
     * ```
     */
    public get headers(): IgxDropDownItemBase[] {
        const headers: IgxDropDownItemBase[] = [];
        if (this.children !== undefined) {
            for (const child of this.children.toArray()) {
                if (child.isHeader) {
                    headers.push(child);
                }
            }
        }

        return headers;
    }

    /**
     * Get dropdown html element
     *
     * ```typescript
     * let myDropDownElement = this.dropdown.element;
     * ```
     */
    public get element() {
        return this.elementRef.nativeElement;
    }

    /**
     * Get dropdown's html element of it scroll container
     */
    protected get scrollContainer() {
        return this.toggleDirective.element;
    }

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selection: IgxSelectionAPIService) { }

    /**
     * Select an item by index
     * @param index of the item to select
     */
    setSelectedItem(index: number) {
        if (index < 0 || index >= this.items.length) {
            return;
        }

        const newSelection = this.items.find((item) => item.index === index);
        if (newSelection.isHeader) {
            return;
        }

        this.changeSelectedItem(newSelection);
    }

    /**
     * Opens the dropdown
     *
     * ```typescript
     * this.dropdown.open();
     * ```
     */
    open(overlaySettings?: OverlaySettings) {
        this.toggleDirective.open(overlaySettings);
    }

    /**
     * Closes the dropdown
     *
     * ```typescript
     * this.dropdown.close();
     * ```
     */
    close() {
        this.toggleDirective.close();
    }

    /**
     * Toggles the dropdown
     *
     * ```typescript
     * this.dropdown.toggle();
     * ```
     */
    toggle(overlaySettings?: OverlaySettings) {
        if (this.toggleDirective.collapsed) {
            this.open(overlaySettings);
        } else {
            this.close();
        }
    }

    /**
     * @hidden
     */
    public get focusedItem(): IgxDropDownItemBase {
        return this._focusedItem;
    }

    /**
     * @hidden
     */
    public set focusedItem(item: IgxDropDownItemBase) {
        this._focusedItem = item;
    }

    /**
     * @hidden
     */
    protected navigate(direction: Navigate, currentIndex?: number) {
        let index = -1;
        if (this._focusedItem) {
            index = currentIndex ? currentIndex : this._focusedItem.index;
        }
        const newIndex = this.getNearestSiblingFocusableItemIndex(index, direction);
        this.navigateItem(newIndex, direction);
    }

    /**
     * @hidden
     */
    navigateFirst() {
        this.navigate(Navigate.Down, -1);
    }

    /**
     * @hidden
     */
    navigateLast() {
        this.navigate(Navigate.Up, this.items.length);
    }

    /**
     * @hidden
     */
    navigateNext() {
        this.navigate(Navigate.Down);
    }

    /**
     * @hidden
     */
    navigatePrev() {
        this.navigate(Navigate.Up);
    }

    /**
     * @hidden
     */
    ngOnInit() {
        this.toggleDirective.id = this.id;
        this.selection.clear(this.id);
    }


    /**
     * @hidden
     */
    onToggleOpening(e: CancelableEventArgs) {
        const eventArgs = { cancel: false };
        this.onOpening.emit(eventArgs);
        e.cancel = eventArgs.cancel;
        if (eventArgs.cancel) {
            return;
        }
        this.scrollToItem(this.selectedItem);
    }

    /**
     * @hidden
     */
    onToggleOpened() {
        this._initiallySelectedItem = this.selectedItem;
        this._focusedItem = this.selectedItem;
        if (this._focusedItem) {
            this._focusedItem.isFocused = true;
        } else if (this.allowItemsFocus) {
            const firstItemIndex = this.getNearestSiblingFocusableItemIndex(-1, Navigate.Down);
            if (firstItemIndex !== -1) {
                this.navigateItem(firstItemIndex);
            }
        }
        this.onOpened.emit();
    }

    /**
     * @hidden
     */
    onToggleClosing(e: CancelableEventArgs) {
        const eventArgs = { cancel: false };
        this.onClosing.emit(eventArgs);
        e.cancel = eventArgs.cancel;
    }

    /**
     * @hidden
     */
    onToggleClosed() {
        if (this._focusedItem) {
            this._focusedItem.isFocused = false;
        }

        this.onClosed.emit();
    }

    /**
     * @hidden
     */
    protected scrollToItem(item: IgxDropDownItemBase) {
        const itemPosition = this.calculateScrollPosition(item);
        this.scrollContainer.scrollTop = (itemPosition);
    }

    protected scrollToHiddenItem(newItem: IgxDropDownItemBase) {
        const elementRect = newItem.element.nativeElement.getBoundingClientRect();
        const parentRect = this.scrollContainer.getBoundingClientRect();
        if (parentRect.top > elementRect.top) {
            this.scrollContainer.scrollTop -= (parentRect.top - elementRect.top);
        }

        if (parentRect.bottom < elementRect.bottom) {
            this.scrollContainer.scrollTop += (elementRect.bottom - parentRect.bottom);
        }
    }

    /**
     * @hidden
     */
    public selectItem(item: IgxDropDownItemBase, event?) {
        if (item === null) {
            return;
        }
        this.changeSelectedItem(item);

        if (event) {
            this.toggleDirective.close();
        }
    }

    /**
     * @hidden
     */
    protected changeSelectedItem(newSelection?: IgxDropDownItemBase): boolean {
        const oldSelection = this.selectedItem;
        if (!newSelection) {
            newSelection = this._focusedItem;
        }

        const args: ISelectionEventArgs = { oldSelection, newSelection, cancel: false };
        this.onSelection.emit(args);
        if (!args.cancel) {
            this.selection.set(this.id, new Set([newSelection]));
        }

        return !args.cancel;
    }

    /**
     * @hidden
     */
    protected calculateScrollPosition(item: IgxDropDownItemBase): number {
        if (!item) {
            return 0;
        }

        const elementRect = item.element.nativeElement.getBoundingClientRect();
        const parentRect = this.scrollContainer.getBoundingClientRect();
        const scrollDelta = parentRect.top - elementRect.top;
        let scrollPosition = this.scrollContainer.scrollTop - scrollDelta;

        const dropDownHeight = this.scrollContainer.clientHeight;
        scrollPosition -= dropDownHeight / 2;
        scrollPosition += item.elementHeight / 2;

        return Math.floor(scrollPosition);
    }

    private getNearestSiblingFocusableItemIndex(startIndex: number, direction: Navigate): number {
        let index = startIndex;
        while (this.items[index + direction] && this.items[index + direction].disabled) {
            index += direction;
        }

        index += direction;
        if (index >= 0 && index < this.items.length) {
            return index;
        } else {
            return -1;
        }
    }

    /**
     * @hidden
     */
    protected navigateItem(newIndex: number, direction?: Navigate) {
        if (newIndex !== -1) {
            const oldItem = this._focusedItem;
            const newItem = this.items[newIndex];
            if (oldItem) {
                oldItem.isFocused = false;
            }
            this._focusedItem = newItem;
            this.scrollToHiddenItem(newItem);
            this._focusedItem.isFocused = true;
        }
    }
}

@Directive({
    selector: '[igxDropDownItemNavigation]'
})
export class IgxDropDownItemNavigationDirective {

    private _target;

    constructor(private element: ElementRef,
        @Inject(forwardRef(() => IgxDropDownComponent)) @Self() @Optional() public dropdown: IgxDropDownComponent) { }

    /**
     * @hidden
     */
    get target() {
        return this._target;
    }

    /**
     * @hidden
     */
    @Input('igxDropDownItemNavigation')
    set target(target: IgxDropDownBase) {
        this._target = target ? target : this.dropdown;
    }

    /**
     * @hidden
     */
    @HostListener('keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        if (event) {
            const key = event.key.toLowerCase();
            if (!this.target.collapsed) { // If dropdown is opened
                const navKeys = ['esc', 'escape', 'enter', 'tab', 'space', 'spacebar', ' ',
            'arrowup', 'up', 'arrowdown', 'down', 'home', 'end'];
                if (navKeys.indexOf(key) === -1) { // If key has appropriate function in DD
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
            } else { // If dropdown is closed, do nothing
                return;
            }
            switch (key) {
                case 'esc':
                case 'escape':
                    this.onEscapeKeyDown(event);
                    break;
                case 'enter':
                case 'tab':
                    this.onEnterKeyDown(event);
                    break;
                case 'space':
                case 'spacebar':
                case ' ':
                    this.onSpaceKeyDown(event);
                    break;
                case 'arrowup':
                case 'up':
                    this.onArrowUpKeyDown(event);
                    break;
                case 'arrowdown':
                case 'down':
                    this.onArrowDownKeyDown(event);
                    break;
                case 'home':
                    this.onHomeKeyDown(event);
                    break;
                case 'end':
                    this.onEndKeyDown(event);
                    break;
                default:
                    return;
            }
        }
    }

    /**
     * @hidden
     */
    onEscapeKeyDown(event) {
        this.target.close();
    }

    /**
     * @hidden
     */
    onSpaceKeyDown(event) {
        // V.S. : IgxDropDownComponent.selectItem needs event to be true in order to close DD as per specification
        this.target.selectItem(this.target.focusedItem, this.target instanceof IgxDropDownComponent);
    }

    /**
     * @hidden
     */
    onEnterKeyDown(event) {
        if (!(this.target instanceof IgxDropDownComponent)) {
            if (this.target.focusedItem.value === 'ADD ITEM') {
                const targetC = this.target as IgxComboDropDownComponent;
                targetC.combo.addItemToCollection();
            } else {
                this.target.close();
            }
            return;
        }
        this.target.selectItem(this.target.focusedItem, event);
    }

    /**
     * @hidden
     */
    onArrowDownKeyDown(event) {
        this.target.navigateNext();
    }

    /**
     * @hidden
     */
    onArrowUpKeyDown(event) {
        this.target.navigatePrev();
    }

    /**
     * @hidden
     */
    onEndKeyDown(event) {
        this.target.navigateLast();
    }

    /**
     * @hidden
     */
    onHomeKeyDown(event) {
        this.target.navigateFirst();
    }
}

/**
 * **Ignite UI for Angular DropDown** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drop-down.html)
 *
 * The Ignite UI for Angular Drop Down displays a scrollable list of items which may be visually grouped and
 * supports selection of a single item. Clicking or tapping an item selects it and closes the Drop Down
 *
 * Example:
 * ```html
 * <igx-drop-down>
 *   <igx-drop-down-item *ngFor="let item of items" disabled={{item.disabled}} isHeader={{item.header}}>
 *     {{ item.value }}
 *   </igx-drop-down-item>
 * </igx-drop-down>
 * ```
 */
@Component({
    selector: 'igx-drop-down',
    templateUrl: './drop-down.component.html'
})
export class IgxDropDownComponent extends IgxDropDownBase {
    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selection: IgxSelectionAPIService) {
        super(elementRef, cdr, selection);
    }

    protected changeSelectedItem(newSelection?: IgxDropDownItemComponent): boolean {
        const oldSelection = this.selectedItem;
        const selectionChanged = super.changeSelectedItem(newSelection);

        if (selectionChanged) {
            if (oldSelection) {
                oldSelection.isSelected = false;
            }
            if (newSelection) {
                newSelection.isSelected = true;
            }
        }

        return selectionChanged;
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownItemNavigationDirective],
    exports: [IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownItemNavigationDirective],
    imports: [CommonModule, IgxToggleModule],
    providers: [IgxSelectionAPIService]
})
export class IgxDropDownModule { }
