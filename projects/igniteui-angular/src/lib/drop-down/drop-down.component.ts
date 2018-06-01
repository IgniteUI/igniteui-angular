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
    Inject
} from '@angular/core';
import { IToggleView } from '../core/navigation';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxToggleDirective, IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxDropDownItemComponent, IgxDropDownItemBase } from './drop-down-item.component';

export interface ISelectionEventArgs {
    oldSelection: IgxDropDownItemBase;
    newSelection: IgxDropDownItemBase;
}

export enum Navigate {
    Up = -1,
    Down = 1
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
 *   <igx-drop-down-item *ngFor='let item of items' isDisabled={{item.disabled}} isHeader={{item.header}}>
 *     {{ item.value }}
 *   </igx-drop-down-item>
 * </igx-drop-down>
 * ```
 */
export class IgxDropDownBase implements IToggleView, OnInit {
    private _initiallySelectedItem: IgxDropDownItemComponent = null;
    protected _focusedItem: any = null;
    private _width;
    private _height;
    private _id = 'DropDown_0';

    @ContentChildren(forwardRef(() => IgxDropDownItemComponent))
    protected children: QueryList<IgxDropDownItemBase>;

    @ViewChild(IgxToggleDirective)
    protected toggleDirective: IgxToggleDirective;

    /**
     * Emitted when item selection is changing, before the selection completes
     */
    @Output()
    public onSelection = new EventEmitter<ISelectionEventArgs>();

    /**
     * Emitted before the dropdown is opened
     */
    @Output()
    public onOpening = new EventEmitter();

    /**
     * Emitted after the dropdown is opened
     */
    @Output()
    public onOpened = new EventEmitter();

    /**
     * Emitted before the dropdown is closed
     */
    @Output()
    public onClosing = new EventEmitter();

    /**
     * Emitted after the dropdown is closed
     */
    @Output()
    public onClosed = new EventEmitter();

    /**
     * Gets/sets the width of the drop down
     */
    @Input()
    get width() {
        return this._width;
    }
    set width(value) {
        this._width = value;
        this.toggleDirective.element.style.width = value;
    }

    /**
     * Gets/sets the height of the drop down
     */
    @Input()
    get height() {
        return this._height;
    }
    set height(value) {
        this._height = value;
        this.toggleDirective.element.style.height = value;
    }

    /**
     * Gets/sets whether items will be able to take focus. If set to true, default value,
     * user will be able to use keyboard navigation.
     */
    @Input()
    public allowItemsFocus = true;

    /**
     * Gets/sets the drop down's id
     */
    @Input()
    get id(): string {
        return this._id;
    }
    set id(value: string) {
        this._id = value;
        this.toggleDirective.id = value;
    }

    /**
     * Gets if the dropdown is collapsed
     */
    public get collapsed(): boolean {
        return this.toggleDirective.collapsed;
    }

    /**
     * Get currently selected item
     */
    public get selectedItem(): any {
        const selection = this.selectionAPI.get_selection(this.id);
        return selection && selection.length > 0 ? selection[0] as IgxDropDownItemComponent : null;
    }

    /**
     * Get all non-header items
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
     */
    public get element() {
        return this.elementRef.nativeElement;
    }

    /**
     * Get dropdown html element
     */
    protected get scrollContainer() {
        return this.toggleDirective.element;
    }

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selectionAPI: IgxSelectionAPIService) { }

    /**
     * Select an item by index
     * @param index of the item to select
     */
    setSelectedItem(index: number) {
        if (index < 0 || index >= this.items.length) {
            return;
        }

        const newSelection = this.items.find((item) => item.index === index);
        if (newSelection.isDisabled) {
            return;
        }

        this.changeSelectedItem(newSelection);
    }

    /**
     * Opens the dropdown
     */
    open() {
        this.toggleDirective.open(true);
    }

    /**
     * Closes the dropdown
     */
    close() {
        this.toggleDirective.close(true);
    }

    /**
     * Toggles the dropdown
     */
    toggle() {
        if (this.toggleDirective.collapsed) {
            this.open();
        } else {
            this.close();
        }
    }

    protected navigate(direction: Navigate, currentIndex?: number) {
        let index = -1;
        if (this._focusedItem) {
            index = currentIndex ? currentIndex : this._focusedItem.index;
        }
        const newIndex = this.getNearestSiblingFocusableItemIndex(index, direction);
        this.focusItem(newIndex, direction);
    }

    navigateFirst() {
        this.navigate(Navigate.Down, -1);
    }

    navigateLast() {
        this.navigate(Navigate.Up, this.items.length);
    }

    navigateNext() {
        this.navigate(Navigate.Down);
    }

    navigatePrev() {
        this.navigate(Navigate.Up);
    }

    ngOnInit() {
        this.toggleDirective.id = this.id;
    }

    onToggleOpening() {
        this.toggleDirective.collapsed = false;
        this.cdr.detectChanges();
        this.scrollToItem(this.selectedItem);
        this.onOpening.emit();
    }

    onToggleOpened() {
        this._initiallySelectedItem = this.selectedItem;
        this._focusedItem = this.selectedItem;
        if (this._focusedItem) {
            this._focusedItem.isFocused = true;
        } else if (this.allowItemsFocus) {
            const firstItemIndex = this.getNearestSiblingFocusableItemIndex(-1, Navigate.Down);
            if (firstItemIndex !== -1) {
                this.focusItem(firstItemIndex);
            }
        }
        this.onOpened.emit();
    }

    onToggleClosing() {
        this.onClosing.emit();
    }

    onToggleClosed() {
        if (this._focusedItem) {
            this._focusedItem.isFocused = false;
        }

        this.onClosed.emit();
    }

    protected scrollToItem(item: IgxDropDownItemBase) {
        const itemPosition = this.calculateScrollPosition(item);
        this.scrollContainer.scrollTop = (itemPosition);
    }

    public scrollToHiddenItem(newItem: IgxDropDownItemBase) {
        const elementRect = newItem.element.nativeElement.getBoundingClientRect();
        const parentRect = this.scrollContainer.getBoundingClientRect();
        if (parentRect.top > elementRect.top) {
            this.scrollContainer.scrollTop -= (parentRect.top - elementRect.top);
        }

        if (parentRect.bottom < elementRect.bottom) {
            this.scrollContainer.scrollTop += (elementRect.bottom - parentRect.bottom);
        }
    }

    public selectItem(item?) {
        if (!item) {
            item = this._focusedItem;
        }
        this.setSelectedItem(this._focusedItem.index);
        this.toggleDirective.close(true);
    }

    protected changeSelectedItem(newSelection?: IgxDropDownItemBase) {
        const oldSelection = this.selectedItem;
        if (!newSelection) {
            newSelection = this._focusedItem;
        }

        this.selectionAPI.set_selection(this.id, [newSelection]);
        const args: ISelectionEventArgs = { oldSelection, newSelection };
        this.onSelection.emit(args);
    }

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
        while (this.items[index + direction] && this.items[index + direction].isDisabled) {
            index += direction;
        }

        index += direction;
        if (index >= 0 && index < this.items.length) {
            return index;
        } else {
            return -1;
        }
    }

    protected focusItem(newIndex: number, direction?: Navigate) {
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

    get target() {
        return this._target;
    }

    @Input('igxDropDownItemNavigation')
    set target(target: IgxDropDownBase) {
        this._target = target ? target : this.dropdown;
    }

    @HostListener('keydown.Enter', ['$event'])
    @HostListener('keydown.Escape', ['$event'])
    @HostListener('keydown.Tab', ['$event'])
    onEscapeKeyDown(event) {
        this.target.close();
        event.preventDefault();
    }

    @HostListener('keydown.Space', ['$event'])
    onSpaceKeyDown(event) {
        this.target.selectItem();
        event.preventDefault();
    }

    @HostListener('keydown.Spacebar', ['$event'])
    onSpaceKeyDownIE(event) {
        this.target.selectItem();
        event.preventDefault();
    }
    /*
    @HostListener('keydown.Enter', ['$event'])
    onEnterKeyDown(event) {
        this.target.selectItem();
        event.preventDefault();
    }*/

    @HostListener('keydown.ArrowDown', ['$event'])
    onArrowDownKeyDown(event) {
        this.target.navigateNext();
        event.preventDefault();
        event.stopPropagation();
    }

    @HostListener('keydown.ArrowUp', ['$event'])
    onArrowUpKeyDown(event) {
        this.target.navigatePrev();
        event.preventDefault();
        event.stopPropagation();
    }

    @HostListener('keydown.End', ['$event'])
    onEndKeyDown(event) {
        this.target.navigateLast();
        event.preventDefault();
    }

    @HostListener('keydown.Home', ['$event'])
    onHomeKeyDown(event) {
        this.target.navigateFirst();
        event.preventDefault();
    }
}

@Component({
    selector: 'igx-drop-down',
    templateUrl: './drop-down.component.html'
})
export class IgxDropDownComponent extends IgxDropDownBase {

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selectionAPI: IgxSelectionAPIService) {
        super(elementRef, cdr, selectionAPI);
    }
}
@NgModule({
    declarations: [IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownItemNavigationDirective],
    exports: [IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownItemNavigationDirective],
    imports: [CommonModule, IgxToggleModule],
    providers: [IgxSelectionAPIService]
})
export class IgxDropDownModule { }
