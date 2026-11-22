import { Component, QueryList, OnDestroy, AfterViewInit, ContentChildren, Input, booleanAttribute, inject } from '@angular/core';
import { IgxComboBase, IGX_COMBO_COMPONENT } from './combo.common';
import { IgxComboAddItemComponent } from './combo-add-item.component';
import { IgxComboAPIService } from './combo.api';
import { IgxComboItemComponent } from './combo-item.component';
import { IgxToggleDirective } from 'igniteui-angular/directives';
import { DropDownActionKey, IDropDownBase, IGX_DROPDOWN_BASE, IgxDropDownComponent, IgxDropDownItemBaseDirective } from 'igniteui-angular/drop-down';

/** @hidden */
@Component({
    selector: 'igx-combo-drop-down',
    templateUrl: '../../../drop-down/src/drop-down/drop-down.component.html',
    providers: [{ provide: IGX_DROPDOWN_BASE, useExisting: IgxComboDropDownComponent }],
    imports: [IgxToggleDirective]
})
export class IgxComboDropDownComponent extends IgxDropDownComponent implements IDropDownBase, OnDestroy, AfterViewInit {
    public combo = inject<IgxComboBase>(IGX_COMBO_COMPONENT);
    protected comboAPI = inject(IgxComboAPIService);

    private _activeDescendantId: string | null = null;

    /** @hidden @internal */
    @Input({ transform: booleanAttribute })
    public singleMode = false;

    /**
     * @hidden
     * @internal
     */
    @ContentChildren(IgxComboItemComponent, { descendants: true })
    public override children: QueryList<IgxDropDownItemBaseDirective> = null;

    /** Whether the add item was the entry made active, as opposed to an index left over from a longer list. */
    private _addItemActive = false;

    /** @hidden @internal */
    public override get scrollContainer(): HTMLElement {
        // TODO: Update, use public API if possible:
        return this.virtDir.dc.location.nativeElement;
    }

    protected get isScrolledToLast(): boolean {
        const scrollTop = this.virtDir.scrollPosition;
        const scrollHeight = this.virtDir.getScroll().scrollHeight;
        return Math.floor(scrollTop + this.virtDir.igxForContainerSize) === scrollHeight;
    }

    protected get lastVisibleIndex(): number {
        return this.combo.totalItemCount ?
            Math.floor(this.combo.itemsMaxHeight / this.combo.itemHeight) :
            this.items.length - 1;
    }

    protected get sortedChildren(): IgxDropDownItemBaseDirective[] {
        if (this.children !== undefined) {
            return this.children.toArray()
                .sort((a: IgxDropDownItemBaseDirective, b: IgxDropDownItemBaseDirective) => a.index - b.index);
        }
        return null;
    }

    /**
     * @hidden @internal
     */
    public override get focusedItem(): IgxDropDownItemBaseDirective | null {
        const item = super.focusedItem;
        // The add item takes the index right after the rows, so an index kept from a longer list
        // can point at it after filtering. It is active only when it was the entry made active.
        return item instanceof IgxComboAddItemComponent && !this._addItemActive ? null : item;
    }

    /**
     * @hidden @internal
     * Returns a stable aria-activedescendant id, unaffected by virtual scroll position.
     * The base class computes this from the live focusedItem getter, which reads from the
     * children QueryList. During virtual scroll the QueryList is recycled, so the getter
     * can return null mid-CD-cycle causing NG0100 in zoneless apps. The id is cached instead.
     */
    public override get activeDescendant(): string | null {
        return this._activeDescendantId;
    }

    /** @hidden @internal */
    public override set focusedItem(item: IgxDropDownItemBaseDirective | null) {
        let entry = item;
        if (item && item.id === undefined) {
            // Virtual { value, index } object passed by navigateItem() under virtual scrolling.
            entry = this.children?.find(e => e.index === item.index) ?? null;
        }
        this._activeDescendantId = entry?.id ?? null;
        this._addItemActive = entry instanceof IgxComboAddItemComponent;
        super.focusedItem = item;
    }

    /**
     * Get all non-header items
     *
     * ```typescript
     * let myDropDownItems = this.dropdown.items;
     * ```
     */
    public override get items(): IgxComboItemComponent[] {
        const items: IgxComboItemComponent[] = [];
        if (this.children !== undefined) {
            const sortedChildren = this.sortedChildren as IgxComboItemComponent[];
            for (const child of sortedChildren) {
                if (!child.isHeader) {
                    items.push(child);
                }
            }
        }

        return items;
    }

    /**
     * @hidden @internal
     */
    public onFocus() {
        this.focusedItem = this._focusedItem || this.items[0];
        this.combo.setActiveDescendant();
    }

    /**
     * @hidden @internal
     */
    public onBlur(_evt?) {
        this.focusedItem = null;
        this.combo.setActiveDescendant();
    }

    /**
     * @hidden @internal
     */
    public override onToggleOpened() {
        this.opened.emit();
    }

    /**
     * @hidden @internal
     */
    public override onToggleClosed() {
        // The add item belongs to the search that showed it, so it is not active again on reopen.
        if (this._addItemActive) {
            this.focusedItem = null;
            this.combo.setActiveDescendant();
        }
        super.onToggleClosed();
    }

    /**
     * @hidden
     */
    public override navigateFirst() {
        this.navigateItem(this.virtDir.igxForOf.findIndex(e => !e?.isHeader));
        this.combo.setActiveDescendant();
    }

    /**
     * @hidden
     */
    public override navigatePrev() {
        if (this._focusedItem && this._focusedItem.index === 0 && this.virtDir.state.startIndex === 0) {
            this.combo.focusSearchInput(false);
            this.focusedItem = null;
        } else {
            super.navigatePrev();
        }
        this.combo.setActiveDescendant();
    }


    /**
     * @hidden
     */
    public override navigateNext() {
        const lastIndex = this.combo.totalItemCount ? this.combo.totalItemCount - 1 : this.virtDir.igxForOf.length - 1;
        if (this._focusedItem && this._focusedItem.index === lastIndex) {
            this.focusAddItemButton();
        } else {
            super.navigateNext();
        }
        this.combo.setActiveDescendant();
    }

    /**
     * @hidden @internal
     */
    public override selectItem(item: IgxDropDownItemBaseDirective) {
        if (item === null || item === undefined) {
            return;
        }
        this.comboAPI.set_selected_item(item.itemID);
        this._activeDescendantId = item.id ?? null;
        this._addItemActive = false;
        this._focusedItem = item;
        this.combo.setActiveDescendant();
    }

    /**
     * @hidden @internal
     */
    public override updateScrollPosition() {
        this.virtDir.getScroll().scrollTop = this._scrollPosition;
    }

    /**
     * @hidden @internal
     */
    public override onItemActionKey(key: DropDownActionKey, event?: KeyboardEvent) {
        switch (key) {
            case DropDownActionKey.ENTER:
                this.handleEnter();
                break;
            case DropDownActionKey.SPACE:
                this.handleSpace();
                break;
            case DropDownActionKey.ESCAPE:
                this.close();
                break;
            case DropDownActionKey.TAB:
                this.close(event);
        }
    }

    public override ngAfterViewInit() {
        this.virtDir.getScroll().addEventListener('scroll', this.scrollHandler);
    }

    /**
     * @hidden @internal
     */
    public override ngOnDestroy(): void {
        this.virtDir.getScroll().removeEventListener('scroll', this.scrollHandler);
        super.ngOnDestroy();
    }

    protected override scrollToHiddenItem(_newItem: any): void { }

    protected scrollHandler = () => {
        this.comboAPI.disableTransitions = true;
    };

    private handleEnter() {
        if (this.isAddItemFocused()) {
            this.combo.addItemToCollection();
            return;
        }
        if (this.singleMode && this.focusedItem) {
            this.combo.select(this.focusedItem.itemID);
        }

        this.close();
    }

    private handleSpace() {
        if (this.isAddItemFocused()) {
            return;
        } else {
            this.selectItem(this.focusedItem);
        }
    }

    private isAddItemFocused(): boolean {
        return this.focusedItem instanceof IgxComboAddItemComponent;
    }

    private focusAddItemButton() {
        if (this.combo.isAddButtonVisible()) {
            this.focusedItem = this.items[this.items.length - 1];
        }
    }
}
