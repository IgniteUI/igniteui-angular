import {
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    forwardRef,
    QueryList,
    OnInit,
    Input,
    OnDestroy,
    ViewChild,
    ContentChild,
    Optional,
    AfterViewInit
} from '@angular/core';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxDropDownItemComponent } from './drop-down-item.component';
import { IgxDropDownBase } from './drop-down.base';
import { DropDownActionKey, Navigate } from './drop-down.common';
import { IGX_DROPDOWN_BASE, IDropDownBase } from './drop-down.common';
import { ISelectionEventArgs } from './drop-down.common';
import { CancelableEventArgs, CancelableBrowserEventArgs, isIE } from '../core/utils';
import { IgxSelectionAPIService } from '../core/selection';
import { Subject } from 'rxjs';
import { IgxDropDownItemBase } from './drop-down-item.base';
import { OverlaySettings, IgxOverlayService } from '../services';
import { IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { take, takeUntil, filter } from 'rxjs/operators';


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
    templateUrl: './drop-down.component.html',
    providers: [{ provide: IGX_DROPDOWN_BASE, useExisting: IgxDropDownComponent }]
})
export class IgxDropDownComponent extends IgxDropDownBase implements IDropDownBase, OnInit, OnDestroy, AfterViewInit {
    protected destroy$ = new Subject<boolean>();
    protected _focusedItemIndex = -1;
    protected _scrollPosition: number;

    @ContentChild(IgxForOfDirective, { read: IgxForOfDirective })
    public virtDir: IgxForOfDirective<any>;

    @ViewChild(IgxToggleDirective)
    protected toggleDirective: IgxToggleDirective;

    /**
     * @hidden
     * @internal
     */
    @ContentChildren(forwardRef(() => IgxDropDownItemComponent), { descendants: true })
    public children: QueryList<IgxDropDownItemBase>;

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

    public get focusedIndex(): number {
        return this._focusedItemIndex;
    }

    /**
     * @hidden @internal
     */
    public get focusedItem(): IgxDropDownItemBase {
        if (this.virtDir) {
            return this._focusedItemIndex !== -1 ? this.children.find(e => e.index === this._focusedItemIndex) : null;
        }
        return this._focusedItem;
    }

    public set focusedItem(value: IgxDropDownItemBase) {
        this._focusedItem = value;
        if (this.virtDir) {
            this._focusedItemIndex = value ? value.index : -1;
        }
    }

    @Input()
    get id(): string {
        return this._id;
    }
    set id(value: string) {
        this.toggleDirective.id = value;
        this.selection.set(value, this.selection.get(this.id));
        this.selection.clear(this.id);
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
    public get selectedItem(): IgxDropDownItemBase {
        const selectedItem = this.selection.first_item(this.id);
        if (selectedItem) {
            if (this.virtDir) {
                return selectedItem;
            } else if (selectedItem.selected) {
                return selectedItem;
            }
            this.selection.clear(this.id);
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

    protected get scrollContainer() {
        return this.toggleDirective.element;
    }

    protected get collectionLength() {
        if (this.virtDir) {
            return this.virtDir.totalItemCount || this.virtDir.igxForOf.length;
        }
    }

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selection: IgxSelectionAPIService,
        @Optional() protected overlay?: IgxOverlayService) {
        super(elementRef, cdr);
    }

    /**
     * Opens the dropdown
     *
     * ```typescript
     * this.dropdown.open();
     * ```
     */
    public open(overlaySettings?: OverlaySettings) {
        this.toggleDirective.open(overlaySettings);
    }

    /**
     * Closes the dropdown
     *
     * ```typescript
     * this.dropdown.close();
     * ```
     */
    public close() {
        this.toggleDirective.close();
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
     * @param index of the item to select
     */
    public setSelectedItem(index: number) {
        if (index < 0 || index >= this.items.length) {
            return;
        }
        const newSelection = this.items[index];
        this.selectItem(newSelection);
    }

    /**
     * Navigates to the item on the specified index
     * If the data in the drop-down is virtualized, pass the index of the item in the virtualized data.
     * @param newIndex number
     */
    public navigateItem(index: number) {
        if (this.virtDir) {
            if (index === -1 || index >= this.collectionLength) {
                return;
            }
            const virtState = this.virtDir.state;
            const subRequired = index < virtState.startIndex || index >= virtState.chunkSize + virtState.startIndex - 1;
            const direction = index > this._focusedItemIndex ? Navigate.Down : Navigate.Up;
            if (subRequired) {
                this.virtDir.scrollTo(index);
            }
            this._focusedItemIndex = index;
            if (subRequired) {
                this.virtDir.onChunkLoad.pipe(take(1)).subscribe(() => {
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

    /**
     * @hidden @internal
     */
    updateScrollPosition() {
        if (this.virtDir) {
            this.virtDir.getVerticalScroll().scrollTop = this._scrollPosition;
        }
    }

    /**
     * @hidden @internal
     */
    public onToggleOpening(e: CancelableEventArgs) {
        this.onOpening.emit(e);
        if (e.cancel) {
            return;
        }
        if (!this.virtDir && this.selectedItem) {
            this.scrollToItem(this.selectedItem);
        }
    }

    /**
     * @hidden @internal
     */
    public onToggleOpened() {
        if (this.selectedItem) {
            this.focusedItem = this.selectedItem;
            this._focusedItem.focused = true;
        } else if (this.allowItemsFocus) {
            this.navigateFirst();
        }
        this.onOpened.emit();
    }

    /**
     * @hidden @internal
     */
    public onToggleClosing(e: CancelableBrowserEventArgs) {
        this.onClosing.emit(e);
        if (this.virtDir) {
            this._scrollPosition = this.virtDir.getVerticalScroll().scrollTop;
        }
    }

    /**
     * @hidden @internal
     */
    public onToggleClosed() {
        if (this._focusedItem) {
            this._focusedItem.focused = false;
        }
        this.onClosed.emit();
    }

    /**
     * @hidden @internal
     */
    public ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
        this.selection.clear(this.id);
    }

    protected scrollToItem(item: IgxDropDownItemBase) {
        const itemPosition = this.calculateScrollPosition(item);

        //  in IE11 setting sctrollTop is somehow slow and forces dropdown
        //  to appear on screen before animation start. As a result dropdown
        //  flickers badly. This is why we set scrollTop just a little later
        //  allowing animation to start and prevent dropdown flickering
        if (isIE()) {
            setTimeout(() => {
                this.scrollContainer.scrollTop = (itemPosition);
            }, 1);
        } else {
            this.scrollContainer.scrollTop = (itemPosition);
        }
    }

    /** @hidden @internal */
    public calculateScrollPosition(item: IgxDropDownItemBase): number {
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
    ngOnInit() {
        this.toggleDirective.id = this.id;
    }

    ngAfterViewInit() {
        if (this.overlay && this.virtDir) {
            this.toggleDirective.onAnimation.pipe(filter(e => e.animationType === 'open'),
                takeUntil(this.destroy$))
                .subscribe(() => {
                    this.updateScrollPosition();
                });
        }
    }

    /** Keydown Handler */
    public onItemActionKey(key: DropDownActionKey, event?: Event) {
        super.onItemActionKey(key, event);
        this.close();
    }

    /**
     * Virtual scroll implementation
     * @hidden @internal
     */
    public navigateFirst() {
        if (this.virtDir) {
            this.navigateItem(0);
        } else {
            super.navigateFirst();
        }
    }

    /**
     * @hidden @internal
     */
    public navigateLast() {
        if (this.virtDir) {
            this.navigateItem(this.virtDir.igxForOf.length - 1);
        } else {
            super.navigateLast();
        }
    }

    /**
     * @hidden @internal
     */
    public navigateNext() {
        if (this.virtDir) {
            this.navigateItem(this._focusedItemIndex !== -1 ? this._focusedItemIndex + 1 : 0);
        } else {
            super.navigateNext();
        }
    }

    /**
     * @hidden @internal
     */
    public navigatePrev() {
        if (this.virtDir) {
            this.navigateItem(this._focusedItemIndex !== -1 ? this._focusedItemIndex - 1 : 0);
        } else {
            super.navigatePrev();
        }
    }

    /**
     * Handles the `onSelection` emit and the drop down toggle when selection changes
     * @hidden
     * @internal
     * @param newSelection
     * @param event
     */
    public selectItem(newSelection?: IgxDropDownItemBase, event?: Event) {
        const oldSelection = this.selectedItem;
        if (!newSelection) {
            newSelection = this._focusedItem;
        }
        if (newSelection === null) {
            return;
        }
        if (newSelection.isHeader) {
            return;
        }
        if (this.virtDir) {
            newSelection = {
                value: newSelection.value,
                index: newSelection.index
            } as any;
        }
        const args: ISelectionEventArgs = { oldSelection, newSelection, cancel: false };
        this.onSelection.emit(args);

        if (!args.cancel) {
            this.selection.set(this.id, new Set([newSelection]));
            if (oldSelection) {
                oldSelection.selected = false;
            }
            if (newSelection) {
                newSelection.selected = true;
            }
            if (event) {
                this.toggleDirective.close();
            }
        }
    }
}

