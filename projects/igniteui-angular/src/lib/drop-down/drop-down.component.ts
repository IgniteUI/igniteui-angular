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
    Output,
    EventEmitter,
    Input,
    OnDestroy,
    AfterViewInit,
} from '@angular/core';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxDropDownItemComponent } from './drop-down-item.component';
import { IgxDropDownBase } from './drop-down.base';
import { IgxDropDownItemNavigationDirective } from './drop-down-navigation.directive';
import { IDropDownItem, IGX_DROPDOWN_BASE, IDropDownBase } from './drop-down-utils';
import { IToggleView } from '../core/navigation/IToggleView';
import { ISelectionEventArgs, Navigate } from './drop-down.common';
import { CancelableEventArgs } from '../core/utils';
import { IgxSelectionAPIService } from '../core/selection';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxDropDownSelectionService } from '../core/drop-down.selection';


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
    providers: [{ provide: IGX_DROPDOWN_BASE, useExisting: IgxDropDownComponent }, IgxDropDownSelectionService]
})
export class IgxDropDownComponent extends IgxDropDownBase implements IDropDownBase, OnInit, IToggleView, OnDestroy, AfterViewInit {
    @ContentChildren(forwardRef(() => IgxDropDownItemComponent))
    protected children: QueryList<IDropDownItem>;

    protected destroy$ = new Subject<boolean>();

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
        this._id = value;
        this.selection.set(this.selection.get());
    }

    /**
     * Get currently selected item
     *
     * ```typescript
     * let currentItem = this.dropdown.selectedItem;
     * ```
     */
    public get selectedItem(): any {
        const selectedItem = this.selection.first_item();
        if (selectedItem) {
            if (selectedItem.isSelected) {
                return selectedItem;
            }
            this.selection.clear();
        }
        return null;
    }

    /**
     * Get all header items
     *
     * ```typescript
     * let myDropDownHeaderItems = this.dropdown.headers;
     * ```
     */
    public get headers(): IDropDownItem[] {
        const headers: IDropDownItem[] = [];
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
     * Select an item by index
     * @param index of the item to select
     */
    public setSelectedItem(index: number) {
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
     * @hidden
     */
    public selectItem(item: IDropDownItem, event?) {
        if (item === null) {
            return;
        }
        if (item.isHeader || item.disabled) {
            return;
        }

        this.changeSelectedItem(item);

        if (event) {
            this.toggleDirective.close();
        }
    }

    public onToggleOpening(e: CancelableEventArgs) {
        super.onToggleOpening(e);
        this.scrollToItem(this.selectedItem);
    }

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
        super.onToggleOpened();
    }

    ngOnInit() {
        super.ngOnInit();
        this.selection.clear();
    }

    ngAfterViewInit() {
        this.selection.onSelection.pipe(takeUntil(this.destroy$)).subscribe(e => this._handleClick(e));
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * @hidden
     */
    protected scrollToItem(item: IDropDownItem) {
        const itemPosition = this.calculateScrollPosition(item);
        this.scrollContainer.scrollTop = (itemPosition);
    }

    /**
     * @hidden
     */
    protected calculateScrollPosition(item: IDropDownItem): number {
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

    protected _handleClick(event: any) {
        this.selectItem(event.itemID);
    }

    /**
     * @hidden
     */
    public getFirstSelectableItem() {
        return this.children.find(child => !child.isHeader && !child.disabled);
    }

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selection: IgxDropDownSelectionService) {
        super(elementRef, cdr);
        if (!selection) {
            this.selection = new IgxDropDownSelectionService();
        }
    }

    protected changeSelectedItem(newSelection?: IDropDownItem): boolean {
        const oldSelection = this.selectedItem;
        if (!newSelection) {
            newSelection = this._focusedItem;
        }
        const args: ISelectionEventArgs = { oldSelection, newSelection, cancel: false };
        this.onSelection.emit(args);
        if (!args.cancel) {
            this.selection.set(new Set([newSelection]));
        }

        if (!args.cancel) {
            if (oldSelection) {
                oldSelection.isSelected = false;
            }
            if (newSelection) {
                newSelection.isSelected = true;
            }
        }

        return !args.cancel;
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

export { ISelectionEventArgs } from './drop-down.common';
