import { CommonModule } from "@angular/common";
import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    EventEmitter,
    forwardRef,
    HostBinding,
    Input,
    NgModule,
    OnInit,
    Output,
    QueryList,
    ViewChild
} from "@angular/core";
import { IgxSelectionAPIService } from "../core/selection";
import { IgxToggleDirective, IgxToggleModule } from "../directives/toggle/toggle.directive";
import { IgxDropDownItemComponent } from "./drop-down-item.component";

export interface ISelectionEventArgs {
    oldSelection: IgxDropDownItemComponent;
    newSelection: IgxDropDownItemComponent;
}

/**
 * **Ignite UI for Angular DropDown** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drop-down.html)
 *
 * TODO: ADD DESCRIPTION HERE, SAME AS IN THE DOCS
 *
 * Example:
 * ```html
 * <igx-drop-down>
 *   <igx-drop-down-item *ngFor="let item of items" isDisabled={{item.disabled}} isHeader={{item.header}}>
 *     {{ item.value }}
 *   </igx-drop-down-item>
 * </igx-drop-down>
 * ```
 */
@Component({
    selector: "igx-drop-down",
    templateUrl: "./drop-down.component.html"
})
export class IgxDropDownComponent implements OnInit, AfterViewChecked {
    private _initiallySelectedItem: IgxDropDownItemComponent = null;
    private _focusedItem: IgxDropDownItemComponent = null;
    private _width;
    private _height;
    private _id = "DropDown_0";

    @ContentChildren(forwardRef(() => IgxDropDownItemComponent))
    private children: QueryList<IgxDropDownItemComponent>;

    /**
     * The toggle directive of IgxDropDown
     */
    @ViewChild(IgxToggleDirective)
    public toggleDirective: IgxToggleDirective;

    /**
     * The event that will be thrown when item is selected,
     * provides reference to the `<IgxDropDownItem>` component as argument
     * @type {EventEmitter}
     */
    @Output()
    public onSelection = new EventEmitter<ISelectionEventArgs>();
    @Output() public onOpening = new EventEmitter();
    @Output() public onOpened = new EventEmitter();
    @Output() public onClosed = new EventEmitter();

    @Input()
    get width() {
        return this._width;
    }
    set width(value) {
        this._width = value;
        this.toggleDirective.element.style.width = value;
    }

    @Input()
    get height() {
        return this._height;
    }
    set height(value) {
        this._height = value;
        this.toggleDirective.element.style.height = value;
    }

    @Input()
    public allowItemsFocus = true;

    constructor(
        private cdr: ChangeDetectorRef,
        private selectionAPI: IgxSelectionAPIService) { }

    @Input()
    get id(): string {
        return this._id;
    }
    set id(value: string) {
        this._id = value;
        this.toggleDirective.id = value;
    }

    get selectedItem(): IgxDropDownItemComponent {
        const selection = this.selectionAPI.get_selection(this.id);
        return selection && selection.length > 0 ? selection[0] as IgxDropDownItemComponent : null;
    }

    public get items(): IgxDropDownItemComponent[] {
        const items: IgxDropDownItemComponent[] = [];
        if (this.children !== undefined) {
            for (const child of this.children.toArray()) {
                if (!child.isHeader) {
                    items.push(child);
                }
            }
        }

        return items;
    }

    public get headers(): IgxDropDownItemComponent[] {
        const headers: IgxDropDownItemComponent[] = [];
        if (this.children !== undefined) {
            for (const child of this.children.toArray()) {
                if (child.isHeader) {
                    headers.push(child);
                }
            }
        }

        return headers;
    }

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

    focusFirst() {
        let focusedItemIndex = 0;
        while (this.items[focusedItemIndex] && this.items[focusedItemIndex].isDisabled) {
            focusedItemIndex++;
        }
        if (focusedItemIndex < this.items.length - 1) {
            if (this._focusedItem) {
                this._focusedItem.isFocused = false;
            }
            this._focusedItem = this.items[focusedItemIndex];
            this._focusedItem.isFocused = true;
        }
    }

    focusLast() {
        let focusedItemIndex = (this.items.length - 1);
        while (this.items[focusedItemIndex] && this.items[focusedItemIndex].isDisabled) {
            focusedItemIndex--;
        }
        if (focusedItemIndex < this.items.length) {
            if (this._focusedItem) {
                this._focusedItem.isFocused = false;
            }
            this._focusedItem = this.items[focusedItemIndex];
            this._focusedItem.isFocused = true;
        }
    }

    focusNext() {
        let focusedItemIndex = -1;
        if (this._focusedItem) {
            focusedItemIndex = this._focusedItem.index;
        }
        while (this.items[focusedItemIndex + 1] && this.items[focusedItemIndex + 1].isDisabled) {
            focusedItemIndex++;
        }
        if (focusedItemIndex < this.items.length - 1) {
            if (this._focusedItem) {
                this._focusedItem.isFocused = false;
            }
            this._focusedItem = this.items[focusedItemIndex + 1];

            const elementRect = this._focusedItem.element.nativeElement.getBoundingClientRect();
            const parentRect = this.toggleDirective.element.getBoundingClientRect();
            if (parentRect.bottom < elementRect.bottom) {
                this.toggleDirective.element.scrollTop += (elementRect.bottom - parentRect.bottom);
            }

            this._focusedItem.isFocused = true;
        }
    }

    focusPrev() {
        if (this._focusedItem) {
            let focusedItemIndex = this._focusedItem.index;
            while ((this.items[focusedItemIndex - 1]) && this.items[focusedItemIndex - 1].isDisabled) {
                focusedItemIndex--;
            }
            if (focusedItemIndex > 0) {
                this._focusedItem.isFocused = false;
                this._focusedItem = this.items[focusedItemIndex - 1];

                const elementRect = this._focusedItem.element.nativeElement.getBoundingClientRect();
                const parentRect = this.toggleDirective.element.getBoundingClientRect();
                if (parentRect.top > elementRect.top) {
                    this.toggleDirective.element.scrollTop -= (parentRect.top - elementRect.top);
                }

                this._focusedItem.isFocused = true;
            }
        }
    }

    ngOnInit() {
        this.toggleDirective.id = this.id;
        this.toggleDirective.element.style.zIndex = 1;
        this.toggleDirective.element.style.position = "absolute";
        this.toggleDirective.element.style.overflowY = "auto";
    }

    ngAfterViewChecked() {
    }

    onToggleOpening() {
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
            this.focusFirst();
        }
        this.onOpened.emit();
    }

    onToggleClosed() {
        if (this._focusedItem) {
            this._focusedItem.isFocused = false;
        }

        this.onClosed.emit();
    }

    open() {
        this.toggleDirective.open(true);
    }

    close() {
        this.toggleDirective.close(true);
    }

    toggle() {
        if (this.toggleDirective.collapsed) {
            this.open();
        } else {
            this.close();
        }
    }

    private scrollToItem(item: IgxDropDownItemComponent) {
        const itemPosition = this.calculateScrollPosition(item);
        this.toggleDirective.element.scrollTop = (itemPosition);
    }

    private changeSelectedItem(newSelection?: IgxDropDownItemComponent) {
        const oldSelection = this.selectedItem;
        if (!newSelection) {
            newSelection = this._focusedItem;
        }

        this.selectionAPI.set_selection(this.id, [newSelection]);
        const args: ISelectionEventArgs = { oldSelection, newSelection };
        this.onSelection.emit(args);
    }

    private calculateScrollPosition(item: IgxDropDownItemComponent): number {
        if (!item) {
            return 0;
        }

        const elementRect = item.element.nativeElement.getBoundingClientRect();
        const parentRect = this.toggleDirective.element.getBoundingClientRect();
        const scrollDelta = parentRect.top - elementRect.top;
        let scrollPosition = this.toggleDirective.element.scrollTop - scrollDelta;

        const dropDownHeight = this.toggleDirective.element.clientHeight;
        scrollPosition -= dropDownHeight / 2;
        scrollPosition += item.elementHeight / 2;

        return Math.floor(scrollPosition);
    }
}

@NgModule({
    declarations: [IgxDropDownComponent, IgxDropDownItemComponent],
    exports: [IgxDropDownComponent, IgxDropDownItemComponent],
    imports: [CommonModule, IgxToggleModule],
    providers: [IgxSelectionAPIService]
})
export class IgxDropDownModule { }
