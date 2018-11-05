import {
    ChangeDetectorRef, Component, ContentChild,
    ElementRef, forwardRef, Inject, QueryList, EventEmitter, OnDestroy
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { IgxDropDownBase, Navigate } from '../drop-down/drop-down.component';
import { IgxDropDownItemBase } from '../drop-down/drop-down-item.component';
import { IgxComboComponent } from './combo.component';
import { IgxComboItemComponent } from './combo-item.component';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { Subject } from 'rxjs';
import { CancelableEventArgs } from '../core/utils';

/** @hidden */
@Component({
    selector: 'igx-combo-drop-down',
    templateUrl: '../drop-down/drop-down.component.html'
})
export class IgxComboDropDownComponent extends IgxDropDownBase implements OnDestroy {
    private _children: QueryList<IgxDropDownItemBase>;
    private _scrollPosition = 0;
    private destroy$ = new Subject<boolean>();
    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selection: IgxSelectionAPIService,
        @Inject(forwardRef(() => IgxComboComponent))
        public combo: IgxComboComponent) {
        super(elementRef, cdr, selection);
    }

    /**
     * @hidden
     */
    protected get scrollContainer() {
        return this.verticalScrollContainer.dc.location.nativeElement;
    }

    /**
     * @hidden
     */
    protected get isScrolledToLast(): boolean {
        const scrollTop = this.verticalScrollContainer.getVerticalScroll().scrollTop;
        const scrollHeight = this.verticalScrollContainer.getVerticalScroll().scrollHeight;
        return Math.floor(scrollTop + this.verticalScrollContainer.igxForContainerSize) === scrollHeight;
    }

    protected get lastVisibleIndex(): number {
        return this.combo.totalItemCount ?
            Math.floor(this.combo.itemsMaxHeight / this.combo.itemHeight) :
            this.items.length - 1;
    }

    /**
     *  Event emitter overrides
     *
     * @hidden
     */
    public onOpened = this.combo.onOpened;

    /**
     * @hidden
     */
    public onOpening = this.combo.onOpening;

    /**
     * @hidden
     */
    public onClosing = this.combo.onClosing;

    /**
     * @hidden
     */
    public onClosed = this.combo.onClosed;

    /**
     * @hidden
     */
    @ContentChild(forwardRef(() => IgxForOfDirective), { read: IgxForOfDirective })
    public verticalScrollContainer: IgxForOfDirective<any>;

    /**
     * @hidden
     */
    protected get children(): QueryList<IgxDropDownItemBase> {
        return this.combo.children;
    }

    protected set children(list: QueryList<IgxDropDownItemBase>) {
        this._children = list;
    }

    /**
     * @hidden
     */
    onFocus() {
        this._focusedItem = this._focusedItem ? this._focusedItem : this.items.length ? this.items[0] : this.children.first;
        if (this._focusedItem) {
            this._focusedItem.isFocused = true;
        }
    }

    /**
     * @hidden
     */
    onBlur(evt?) {
        if (this._focusedItem) {
            this._focusedItem.isFocused = false;
            this._focusedItem = null;
        }
    }

    /**
     * @hidden
     */
    public get selectedItem(): any[] {
        const sel = this.selection.get(this.combo.id);
        return sel ? Array.from(sel) : [];
    }

    /**
     * @hidden
     */
    navigatePrev() {
        if (this._focusedItem.index === 0 && this.verticalScrollContainer.state.startIndex === 0) {
            this.combo.searchInput.nativeElement.focus();
        } else {
            super.navigatePrev();
        }
    }

    /**
     * @hidden
     */
    navigateFirst() {
        const vContainer = this.verticalScrollContainer;
        if (vContainer.state.startIndex === 0) {
            this.focusItem(0);
            return;
        }
        vContainer.scrollTo(0);
        this.subscribeNext(vContainer, () => {
            this.combo.triggerCheck();
            this.focusItem(0);
            this.combo.triggerCheck();
        });
    }

    /**
     * @hidden
     */
    navigateLast() {
        const vContainer = this.verticalScrollContainer;
        const scrollTarget = this.combo.totalItemCount ?
            this.combo.totalItemCount - 1 :
            Math.max(this.combo.data.length - 1, vContainer.igxForOf.length - 1);
        if (vContainer.igxForOf.length <= vContainer.state.startIndex + vContainer.state.chunkSize) {
            this.focusItem(this.items.length - 1);
            return;
        }
        vContainer.scrollTo(scrollTarget);
        this.subscribeNext(vContainer, () => {
            this.combo.triggerCheck();
            this.focusItem(this.items.length - 1);
            this.combo.triggerCheck();
        });
    }

    /**
     * @hidden
     */
    private navigateRemoteItem(direction) {
        this.verticalScrollContainer.addScrollTop(direction * this.combo.itemHeight);
        this.subscribeNext(this.verticalScrollContainer, () => {
            if (direction === Navigate.Up) {
                this.focusItem(0);
            } else {
                this.focusItem(this.focusedItem.index);
            }
        });
    }

    /**
     * @hidden
     */
    setSelectedItem(itemID: any, select = true) {
        this.combo.setSelectedItem(itemID, select);
    }

    /**
     * @hidden
     */
    selectItem(item: IgxComboItemComponent, event?: Event) {
        if (item.value === 'ADD ITEM') {
            if (event) {
                this.combo.addItemToCollection();
            }
        } else {
            this.setSelectedItem(item.itemID);
            this._focusedItem = item;
        }
    }

    /**
     * @hidden
     */
    navigateItem(newIndex: number, direction?: number) {
        // Virtual scrolling holds one hidden loaded element at the bottom of the drop down list.
        // At the top there isn't such a hidden element.
        // That's why we hold the first or the one before the last list item as focused, during keyboard navigation.
        // This means that if we want to focus next element, it's the last hidden element when scrolling down
        // and when scrolling up it is not loaded at all.
        // It's more special case when srcolling down and the hidden element is group header,
        // which is not part of the this.items collection.
        // In that case the real item is not hidden, but not loaded at all by the virtualization,
        // and this is the same case as normal scroll up.
        const vContainer = this.verticalScrollContainer;
        const extraScroll = this.combo.isAddButtonVisible();
        if (direction) {
            if (direction === Navigate.Down && extraScroll) {
                if (vContainer.igxForOf[vContainer.igxForOf.length - 1] === this.focusedItem.value) {
                    if (this.focusedItem) {
                        this.focusedItem.isFocused = false;
                    }
                    this.focusedItem = this.children.last;
                    this.focusedItem.isFocused = true;
                    return;
                } else if (vContainer.igxForOf[vContainer.state.chunkSize + vContainer.state.startIndex - 2] ===
                    this.focusedItem.value) {
                    this.subscribeNext(vContainer, () => {
                        if (this.focusedItem.isHeader &&
                            vContainer.state.startIndex + vContainer.state.chunkSize < vContainer.igxForOf.length) {
                            vContainer.scrollNext();
                        }
                    });
                    vContainer.scrollNext();
                    return;
                }
            }
        }
        if (newIndex === -1) {
            this.navigateVirtualItem(direction, extraScroll ? 1 : 0);
        } else if (newIndex === this.lastVisibleIndex && !this.isScrolledToLast) {
            this.navigateVirtualItem(direction, extraScroll ? 1 : 0);
        } else if (newIndex === this.lastVisibleIndex && this.isScrolledToLast) {
            // When initially scrolling to the last item, a pseudo element is present in the children list
            // We need to check if the element we're on is an actual element or an empty 'igx-combo-item' child
            if (this.items[newIndex].element && this.items[newIndex].element.nativeElement.clientHeight) {
                super.navigateItem(newIndex);
            }
            return;
        } else {
            super.navigateItem(newIndex);
        }
    }

    private navigateVirtualItem(direction: Navigate, extraScroll?: number) {
        const vContainer = this.verticalScrollContainer;
        // If the data is vitualized, data.length === vContainer.chunkSize, so the below checks are no-longer valid
        if (vContainer && vContainer.totalItemCount && vContainer.totalItemCount !== 0) {
            this.navigateRemoteItem(direction);
            return;
        }
        let state = vContainer.state;
        if (this.isScrolledToLast && direction === Navigate.Down) { // If on the bottom most item, do not subscribe
            return;
        }
        // If on the topmost item, do not subscribe
        if (this.verticalScrollContainer.getVerticalScroll().scrollTop === 0 && direction === Navigate.Up) {
            return;
        }
        const isScrollUp = direction === Navigate.Up;
        let newScrollStartIndex = isScrollUp ? state.startIndex - 1 : state.startIndex + 1;
        if (newScrollStartIndex < 0) {
            newScrollStartIndex = 0;
        }
        let data = vContainer.igxForOf;

        if (data.length === 0) {
            const newItem = this.children.first;
            if (!newItem) { return; }
            newItem.isFocused = true;
            this._focusedItem = newItem;
            return;
        }
        // Following the big comment above, when the new item is group header, then we need to load 2 elements at once.
        if (data[newScrollStartIndex].isHeader && direction === Navigate.Up ||
            data[newScrollStartIndex + state.chunkSize - 2].isHeader && direction === Navigate.Down) {
            newScrollStartIndex = isScrollUp ? newScrollStartIndex - 1 : newScrollStartIndex + 1;
            // newScrollStartIndex = mod && direction === Navigate.Down ? newScrollStartIndex + 1 : newScrollStartIndex;
            if (newScrollStartIndex < 0) { // If the next item loaded is a header and is also the very first item in the list.
                vContainer.scrollTo(0); // Scrolls to the beginning of the list and switches focus to the searchInput
                this.subscribeNext(vContainer, () => {
                    this.combo.searchInput.nativeElement.focus();
                    if (this.focusedItem) {
                        this.focusedItem.isFocused = false;
                    }
                    this.focusedItem = null;
                });
                return;
            }
        }
        // If it is the very last item in the collection, when moving down
        if (newScrollStartIndex + state.chunkSize === data.length + 1) {
            vContainer.scrollTo(newScrollStartIndex);
            return;
        }
        vContainer.scrollTo(newScrollStartIndex);
        this.subscribeNext(vContainer, () => {
            state = vContainer.state;
            data = vContainer.igxForOf;

            // Because we are sure that if we scroll up then the top element is not a header, then we focus the first one.
            // When we scroll down, if the newly loaded element that is hidden is group header,
            // then we focus the last item from the this.items array.
            // This is because the this.items doens't contains the group headers, while there are rendered in the combo drop down.
            // If the newly loaded element that is hidden isn't a header, this means that the first visible item, the one that needs focus,
            // should be either the one that is before the last item (this.items).
            const isBottomHiddenHeader = data[state.startIndex + state.chunkSize - 1].isHeader;
            const index = isScrollUp ? 0 : isBottomHiddenHeader ? this.items.length - 1 - extraScroll : this.items.length - 2 - extraScroll;

            this.focusItem(index);
        });
    }

    private subscribeNext(virtualContainer: any, callback: (elem?) => void) {
        virtualContainer.onChunkLoad.pipe(takeUntil(this.destroy$)).subscribe({
            next: (e: any) => {
                callback(e);
            }
        });
    }

    private focusItem(visibleIndex: number) {
        const oldItem = this._focusedItem;
        if (oldItem) {
            oldItem.isFocused = false;
        }
        const newItem = this.items[visibleIndex];
        newItem.isFocused = true;
        this._focusedItem = newItem;
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
        this.combo.handleInputChange();
    }

    /**
     * @hidden
     */
    onToggleOpened() {
        this.combo.triggerCheck();
        this.combo.searchInput.nativeElement.focus();
        this.onOpened.emit();
    }

    /**
     * @hidden
     */
    onToggleClosed() {
        this.combo.comboInput.nativeElement.focus();
        this.onClosed.emit();
    }

    /**
     * @hidden
     */
    onToggleClosing(e: CancelableEventArgs) {
        this.combo.searchValue = '';
        super.onToggleClosing(e);
        this._scrollPosition = this.verticalScrollContainer.getVerticalScroll().scrollTop;
    }

    /**
     * @hidden
     */
    updateScrollPosition() {
        this.verticalScrollContainer.getVerticalScroll().scrollTop = this._scrollPosition;
    }

    /**
     *@hidden
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
