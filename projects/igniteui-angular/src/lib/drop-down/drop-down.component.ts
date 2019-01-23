import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    forwardRef,
    NgModule,
    QueryList,
    OnInit,
    Input,
    OnDestroy,
    ViewChild,
    EventEmitter,
    Output,
} from '@angular/core';
import { IgxToggleModule, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxDropDownItemComponent } from './drop-down-item.component';
import { IgxDropDownBase } from './drop-down.base';
import { IgxDropDownItemNavigationDirective, DropDownActionKey } from './drop-down-navigation.directive';
import { IGX_DROPDOWN_BASE, IDropDownBase } from './drop-down.common';
import { ISelectionEventArgs, Navigate } from './drop-down.common';
import { CancelableEventArgs, isIE } from '../core/utils';
import { IgxSelectionAPIService } from '../core/selection';
import { Subject } from 'rxjs';
import { IgxDropDownItemBase } from './drop-down-item.base';
import { OverlaySettings } from '../services';


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
export class IgxDropDownComponent extends IgxDropDownBase implements IDropDownBase, OnInit, OnDestroy {
    @ViewChild(IgxToggleDirective)
    protected toggleDirective: IgxToggleDirective;

    protected destroy$ = new Subject<boolean>();
    /**
     * @hidden
     * @internal
     */
    @ContentChildren(forwardRef(() => IgxDropDownItemComponent))
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
    public onOpened = new EventEmitter<void>();

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
    public onClosed = new EventEmitter<void>();

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
            if (selectedItem.selected) {
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

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selection: IgxSelectionAPIService) {
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
        if (this.toggleDirective.collapsed) {
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
     * @param newIndex number
     */
    public navigateItem(index: number) {
        super.navigateItem(index);
        if (this.allowItemsFocus && this.focusedItem) {
            this.focusedItem.element.nativeElement.focus();
            this.cdr.markForCheck();
        }
    }

    /**
     * @hidden
     */
    public onToggleOpening(e: CancelableEventArgs) {
        this.onOpening.emit(e);
        if (e.cancel) {
            return;
        }
        this.scrollToItem(this.selectedItem);
    }

    /**
     * @hidden
     */
    public onToggleOpened() {
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
    public onToggleClosing(e: CancelableEventArgs) {
        this.onClosing.emit(e);
    }

    /**
     * @hidden
     */
    public onToggleClosed() {
        if (this._focusedItem) {
            this._focusedItem.isFocused = false;
        }
        this.onClosed.emit();
    }

    /**
     * @hidden
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

    /**
     * @hidden
     */
    ngOnInit() {
        this.toggleDirective.id = this.id;
    }

    /** Keydown Handler */
    public onItemActionKey(key: DropDownActionKey, event?: Event) {
        super.onItemActionKey(key, event);
        this.close();
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
