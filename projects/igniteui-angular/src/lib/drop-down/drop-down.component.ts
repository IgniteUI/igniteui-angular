import {
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    forwardRef,
    QueryList,
    OnChanges,
    Input,
    OnDestroy,
    ViewChild,
    ContentChild,
    AfterViewInit,
    Output,
    EventEmitter,
    SimpleChanges,
    booleanAttribute,
    Inject
} from '@angular/core';
import { IgxToggleDirective, ToggleViewEventArgs } from '../directives/toggle/toggle.directive';
import { IgxDropDownItemComponent } from './drop-down-item.component';
import { IgxDropDownBaseDirective } from './drop-down.base';
import { DropDownActionKey, Navigate } from './drop-down.common';
import { IGX_DROPDOWN_BASE, IDropDownBase } from './drop-down.common';
import { ISelectionEventArgs } from './drop-down.common';
import { IBaseCancelableBrowserEventArgs, IBaseEventArgs } from '../core/utils';
import { IgxSelectionAPIService } from '../core/selection';
import { Subject } from 'rxjs';
import { IgxDropDownItemBaseDirective } from './drop-down-item.base';
import { IgxForOfToken } from '../directives/for-of/for_of.directive';
import { take } from 'rxjs/operators';
import { OverlaySettings } from '../services/overlay/utilities';
import { DOCUMENT, NgIf } from '@angular/common';
import { ConnectedPositioningStrategy } from '../services/public_api';

/**
 * **Ignite UI for Angular DropDown** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drop-down)
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
    templateUrl: './drop-down.component.html',
    providers: [{ provide: IGX_DROPDOWN_BASE, useExisting: IgxDropDownComponent }],
    imports: [IgxToggleDirective, NgIf]
})
export class IgxDropDownComponent extends IgxDropDownBaseDirective implements IDropDownBase, OnChanges, AfterViewInit, OnDestroy {
    /**
     * @hidden
     * @internal
     */
    @ContentChildren(forwardRef(() => IgxDropDownItemComponent), { descendants: true })
    public override children: QueryList<IgxDropDownItemBaseDirective>;

    /**
     * Emitted before the dropdown is opened
     *
     * ```html
     * <igx-drop-down (opening)='handleOpening($event)'></igx-drop-down>
     * ```
     */
    @Output()
    public opening = new EventEmitter<IBaseCancelableBrowserEventArgs>();

    /**
     * Emitted after the dropdown is opened
     *
     * ```html
     * <igx-drop-down (opened)='handleOpened($event)'></igx-drop-down>
     * ```
     */
    @Output()
    public opened = new EventEmitter<IBaseEventArgs>();

    /**
     * Emitted before the dropdown is closed
     *
     * ```html
     * <igx-drop-down (closing)='handleClosing($event)'></igx-drop-down>
     * ```
     */
    @Output()
    public closing = new EventEmitter<IBaseCancelableBrowserEventArgs>();

    /**
     * Emitted after the dropdown is closed
     *
     * ```html
     * <igx-drop-down (closed)='handleClosed($event)'></igx-drop-down>
     * ```
     */
    @Output()
    public closed = new EventEmitter<IBaseEventArgs>();

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
    @Input({ transform: booleanAttribute })
    public allowItemsFocus = false;

    /**
     * Sets aria-labelledby attribute value.
     * ```html
     * <igx-drop-down [labelledby]="labelId"></igx-drop-down>
     * ```
     */
    @Input()
    public labelledBy: string;

    @ContentChild(IgxForOfToken)
    protected virtDir: IgxForOfToken<any>;

    @ViewChild(IgxToggleDirective, { static: true })
    protected toggleDirective: IgxToggleDirective;

    @ViewChild('scrollContainer', { static: true })
    protected scrollContainerRef: ElementRef;

    /**
     * @hidden @internal
     */
    public override get focusedItem(): IgxDropDownItemBaseDirective {
        if (this.virtDir) {
            return this._focusedItem && this._focusedItem.index !== -1 ?
                (this.children.find(e => e.index === this._focusedItem.index) || null) :
                null;
        }
        return this._focusedItem;
    }

    public override set focusedItem(value: IgxDropDownItemBaseDirective) {
        if (!value) {
            this.selection.clear(`${this.id}-active`);
            this._focusedItem = null;
            return;
        }
        this._focusedItem = value;
        if (this.virtDir) {
            this._focusedItem = {
                value: value.value,
                index: value.index
            } as IgxDropDownItemBaseDirective;
        }
        this.selection.set(`${this.id}-active`, new Set([this._focusedItem]));
    }

    public override get id(): string {
        return this._id;
    }
    public override set id(value: string) {
        this.selection.set(value, this.selection.get(this.id));
        this.selection.clear(this.id);
        this.selection.set(value, this.selection.get(`${this.id}-active`));
        this.selection.clear(`${this.id}-active`);
        this._id = value;
    }

    /** Id of the internal listbox of the drop down */
    public get listId() {
        return this.id + '-list';
    }

    /**
     * Get currently selected item
     *
     * ```typescript
     * let currentItem = this.dropdown.selectedItem;
     * ```
     */
    public get selectedItem(): IgxDropDownItemBaseDirective {
        const selectedItem = this.selection.first_item(this.id);
        if (selectedItem) {
            return selectedItem;
        }
        return null;
    }

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

    /** @hidden @internal */
    public override get scrollContainer(): HTMLElement {
        return this.scrollContainerRef.nativeElement;
    }

    protected get collectionLength() {
        if (this.virtDir) {
            return this.virtDir.totalItemCount || this.virtDir.igxForOf.length;
        }
    }

    protected destroy$ = new Subject<boolean>();
    protected _scrollPosition: number;

    constructor(
        elementRef: ElementRef,
        cdr: ChangeDetectorRef,
        @Inject(DOCUMENT) document: any,
        protected selection: IgxSelectionAPIService) {
        super(elementRef, cdr, document);
    }

    /**
     * Opens the dropdown
     *
     * ```typescript
     * this.dropdown.open();
     * ```
     */
    public open(overlaySettings?: OverlaySettings) {
        const settings = { ... {}, ...this.getDefaultOverlaySettings(), ...overlaySettings };
        this.toggleDirective.open(settings);
        this.updateScrollPosition();
    }

    /**
     * @hidden @internal
     */
    public getDefaultOverlaySettings(): OverlaySettings {
        return {
            closeOnOutsideClick: true,
            modal: false,
            positionStrategy: new ConnectedPositioningStrategy()
        };
    }

    /**
     * Closes the dropdown
     *
     * ```typescript
     * this.dropdown.close();
     * ```
     */
    public close(event?: Event) {
        this.toggleDirective.close(event);
    }

    /**
     * Toggles the dropdown
     *
     * ```typescript
     * this.dropdown.toggle();
     * ```
     */
    public toggle(overlaySettings?: OverlaySettings) {
        if (this.collapsed || this.toggleDirective.isClosing) {
            this.open(overlaySettings);
        } else {
            this.close();
        }
    }

    /**
     * Select an item by index
     *
     * @param index of the item to select; If the drop down uses *igxFor, pass the index in data
     */
    public setSelectedItem(index: number) {
        if (index < 0 || index >= this.items.length) {
            return;
        }
        let newSelection: IgxDropDownItemBaseDirective;
        if (this.virtDir) {
            newSelection = {
                value: this.virtDir.igxForOf[index],
                index
            } as IgxDropDownItemBaseDirective;
        } else {
            newSelection = this.items[index];
        }
        this.selectItem(newSelection);
    }

    /**
     * Navigates to the item on the specified index
     * If the data in the drop-down is virtualized, pass the index of the item in the virtualized data.
     *
     * @param newIndex number
     */
    public override navigateItem(index: number) {
        if (this.virtDir) {
            if (index === -1 || index >= this.collectionLength) {
                return;
            }
            const direction = index > (this.focusedItem ? this.focusedItem.index : -1) ? Navigate.Down : Navigate.Up;
            const subRequired = this.isIndexOutOfBounds(index, direction);
            this.focusedItem = {
                value: this.virtDir.igxForOf[index],
                index
            } as IgxDropDownItemBaseDirective;
            if (subRequired) {
                this.virtDir.scrollTo(index);
            }
            if (subRequired) {
                this.virtDir.chunkLoad.pipe(take(1)).subscribe(() => {
                    this.skipHeader(direction);
                });
            } else {
                this.skipHeader(direction);
            }
        } else {
            super.navigateItem(index);
        }
        if (this.allowItemsFocus && this.focusedItem) {
            this.focusedItem.element.nativeElement.focus();
            this.cdr.markForCheck();
        }
    }

    /**
     * @hidden @internal
     */
    public updateScrollPosition() {
        if (!this.virtDir) {
            return;
        }
        if (!this.selectedItem) {
            this.virtDir.scrollTo(0);
            return;
        }
        let targetScroll = this.virtDir.getScrollForIndex(this.selectedItem.index);
        // TODO: This logic _cannot_ be right, those are optional user-provided inputs that can be strings with units, refactor:
        const itemsInView = this.virtDir.igxForContainerSize / this.virtDir.igxForItemSize;
        targetScroll -= (itemsInView / 2 - 1) * this.virtDir.igxForItemSize;
        this.virtDir.getScroll().scrollTop = targetScroll;
    }

    /**
     * @hidden @internal
     */
    public onToggleOpening(e: IBaseCancelableBrowserEventArgs) {
        const args: IBaseCancelableBrowserEventArgs = { owner: this, event: e.event, cancel: false };
        this.opening.emit(args);
        e.cancel = args.cancel;
        if (e.cancel) {
            return;
        }

        if (this.virtDir) {
            this.virtDir.scrollPosition = this._scrollPosition;
        }
    }

    /**
     * @hidden @internal
     */
    public onToggleContentAppended(_event: ToggleViewEventArgs) {
        if (!this.virtDir && this.selectedItem) {
            this.scrollToItem(this.selectedItem);
        }
    }

    /**
     * @hidden @internal
     */
    public onToggleOpened() {
        this.updateItemFocus();
        this.opened.emit({ owner: this });
    }

    /**
     * @hidden @internal
     */
    public onToggleClosing(e: IBaseCancelableBrowserEventArgs) {
        const args: IBaseCancelableBrowserEventArgs = { owner: this, event: e.event, cancel: false };
        this.closing.emit(args);
        e.cancel = args.cancel;
        if (e.cancel) {
            return;
        }
        if (this.virtDir) {
            this._scrollPosition = this.virtDir.scrollPosition;
        }
    }

    /**
     * @hidden @internal
     */
    public onToggleClosed() {
        this.focusItem(false);
        this.closed.emit({ owner: this });
    }

    /**
     * @hidden @internal
     */
    public ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
        this.selection.delete(this.id);
        this.selection.delete(`${this.id}-active`);
    }

    /** @hidden @internal */
    public calculateScrollPosition(item: IgxDropDownItemBaseDirective): number {
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

    /**
     * @hidden @internal
     */
    public ngOnChanges(changes: SimpleChanges) {
        if (changes.id) {
            // temp workaround until fix --> https://github.com/angular/angular/issues/34992
            this.toggleDirective.id = changes.id.currentValue;
        }
    }

    public ngAfterViewInit() {
        if (this.virtDir) {
            this.virtDir.igxForItemSize = 28;
        }
    }

    /** Keydown Handler */
    public override onItemActionKey(key: DropDownActionKey, event?: Event) {
        super.onItemActionKey(key, event);
        this.close(event);
    }

    /**
     * Virtual scroll implementation
     *
     * @hidden @internal
     */
    public override navigateFirst() {
        if (this.virtDir) {
            this.navigateItem(0);
        } else {
            super.navigateFirst();
        }
    }

    /**
     * @hidden @internal
     */
    public override navigateLast() {
        if (this.virtDir) {
            this.navigateItem(this.virtDir.totalItemCount ? this.virtDir.totalItemCount - 1 : this.virtDir.igxForOf.length - 1);
        } else {
            super.navigateLast();
        }
    }

    /**
     * @hidden @internal
     */
    public override navigateNext() {
        if (this.virtDir) {
            this.navigateItem(this._focusedItem ? this._focusedItem.index + 1 : 0);
        } else {
            super.navigateNext();
        }
    }

    /**
     * @hidden @internal
     */
    public override navigatePrev() {
        if (this.virtDir) {
            this.navigateItem(this._focusedItem ? this._focusedItem.index - 1 : 0);
        } else {
            super.navigatePrev();
        }
    }

    /**
     * Handles the `selectionChanging` emit and the drop down toggle when selection changes
     *
     * @hidden
     * @internal
     * @param newSelection
     * @param emit
     * @param event
     */
    public override selectItem(newSelection?: IgxDropDownItemBaseDirective, event?: Event, emit = true) {
        const oldSelection = this.selectedItem;
        if (!newSelection) {
            newSelection = this.focusedItem;
        }
        if (newSelection === null) {
            return;
        }
        if (newSelection instanceof IgxDropDownItemBaseDirective && newSelection.isHeader) {
            return;
        }
        if (this.virtDir) {
            newSelection = {
                value: newSelection.value,
                index: newSelection.index
            } as IgxDropDownItemBaseDirective;
        }
        const args: ISelectionEventArgs = { oldSelection, newSelection, cancel: false, owner: this };

        if (emit) {
            this.selectionChanging.emit(args);
        }

        if (!args.cancel) {
            if (this.isSelectionValid(args.newSelection)) {
                this.selection.set(this.id, new Set([args.newSelection]));
                if (!this.virtDir) {
                    if (oldSelection) {
                        oldSelection.selected = false;
                    }
                    if (args.newSelection) {
                        args.newSelection.selected = true;
                    }
                }
                if (event) {
                    this.toggleDirective.close(event);
                }
            } else {
                throw new Error('Please provide a valid drop-down item for the selection!');
            }
        }
    }

    /**
     * Clears the selection of the dropdown
     * ```typescript
     * this.dropdown.clearSelection();
     * ```
     */
    public clearSelection() {
        const oldSelection = this.selectedItem;
        const newSelection: IgxDropDownItemBaseDirective = null;
        const args: ISelectionEventArgs = { oldSelection, newSelection, cancel: false, owner: this };
        this.selectionChanging.emit(args);
        if (this.selectedItem && !args.cancel) {
            this.selectedItem.selected = false;
            this.selection.clear(this.id);
        }
    }

    /**
     * Checks whether the selection is valid
     * `null` - the selection should be emptied
     * Virtual? - the selection should at least have and `index` and `value` property
     * Non-virtual? - the selection should be a valid drop-down item and **not** be a header
     */
    protected isSelectionValid(selection: any): boolean {
        return selection === null
            || (this.virtDir && selection.hasOwnProperty('value') && selection.hasOwnProperty('index'))
            || (selection instanceof IgxDropDownItemComponent && !selection.isHeader);
    }

    protected scrollToItem(item: IgxDropDownItemBaseDirective) {
        this.scrollContainer.scrollTop = this.calculateScrollPosition(item);
    }

    protected focusItem(value: boolean) {
        if (value || this._focusedItem) {
            this._focusedItem.focused = value;
        }
    }

    protected updateItemFocus() {
        if (this.selectedItem) {
            this.focusedItem = this.selectedItem;
            this.focusItem(true);
        } else if (this.allowItemsFocus) {
            this.navigateFirst();
        }
    }

    protected skipHeader(direction: Navigate) {
        if (!this.focusedItem) {
            return;
        }
        if (this.focusedItem.isHeader || this.focusedItem.disabled) {
            if (direction === Navigate.Up) {
                this.navigatePrev();
            } else {
                this.navigateNext();
            }
        }
    }

    private isIndexOutOfBounds(index: number, direction: Navigate) {
        const virtState = this.virtDir.state;
        const currentPosition = this.virtDir.getScroll().scrollTop;
        const itemPosition = this.virtDir.getScrollForIndex(index, direction === Navigate.Down);
        const indexOutOfChunk = index < virtState.startIndex || index > virtState.chunkSize + virtState.startIndex;
        const scrollNeeded = direction === Navigate.Down ? currentPosition < itemPosition : currentPosition > itemPosition;
        const subRequired = indexOutOfChunk || scrollNeeded;
        return subRequired;
    }
}

