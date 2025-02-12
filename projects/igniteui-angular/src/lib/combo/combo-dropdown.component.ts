import {
    ChangeDetectorRef, Component, ElementRef, Inject, QueryList, OnDestroy, AfterViewInit, ContentChildren, Input, booleanAttribute
} from '@angular/core';
import { IgxComboBase, IGX_COMBO_COMPONENT } from './combo.common';
import { IDropDownBase, IGX_DROPDOWN_BASE } from '../drop-down/drop-down.common';
import { IgxDropDownComponent } from '../drop-down/drop-down.component';
import { DropDownActionKey } from '../drop-down/drop-down.common';
import { IgxComboAddItemComponent } from './combo-add-item.component';
import { IgxComboAPIService } from './combo.api';
import { IgxDropDownItemBaseDirective } from '../drop-down/drop-down-item.base';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxComboItemComponent } from './combo-item.component';
import { DOCUMENT, NgIf } from '@angular/common';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';

/** @hidden */
@Component({
    selector: 'igx-combo-drop-down',
    templateUrl: '../drop-down/drop-down.component.html',
    providers: [{ provide: IGX_DROPDOWN_BASE, useExisting: IgxComboDropDownComponent }],
    imports: [IgxToggleDirective, NgIf]
})
export class IgxComboDropDownComponent extends IgxDropDownComponent implements IDropDownBase, OnDestroy, AfterViewInit {
    /** @hidden @internal */
    @Input({ transform: booleanAttribute })
    public singleMode = false;

    /**
     * @hidden
     * @internal
     */
    @ContentChildren(IgxComboItemComponent, { descendants: true })
    public override children: QueryList<IgxDropDownItemBaseDirective> = null;

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

    constructor(
        elementRef: ElementRef,
        cdr: ChangeDetectorRef,
        @Inject(DOCUMENT) document: any,
        selection: IgxSelectionAPIService,
        @Inject(IGX_COMBO_COMPONENT) public combo: IgxComboBase,
        protected comboAPI: IgxComboAPIService) {
        super(elementRef, cdr, document, selection);
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
    public override onItemActionKey(key: DropDownActionKey) {
        switch (key) {
            case DropDownActionKey.ENTER:
                this.handleEnter();
                break;
            case DropDownActionKey.SPACE:
                this.handleSpace();
                break;
            case DropDownActionKey.ESCAPE:
                this.close();
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
