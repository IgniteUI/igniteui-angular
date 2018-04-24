import { CommonModule } from "@angular/common";
import {
    AfterViewInit,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    NgModule,
    OnInit,
    Output,
    QueryList,
    Renderer,
    ViewChild,
    ViewChildren
} from "@angular/core";
import { IgxToggleActionDirective, IgxToggleDirective, IgxToggleModule } from "../directives/toggle/toggle.directive";
import { IgxDropDownItemComponent } from "./dropDownItem.component";

export interface ISelectionEventArgs {
    oldSelection: IgxDropDownItemComponent;
    newSelection: IgxDropDownItemComponent;
    event?: Event;
}

@Component({
    selector: "igx-drop-down",
    templateUrl: "./dropDown.component.html"
})
export class IgxDropDownComponent implements OnInit, AfterViewInit {
    private _selectedItem: IgxDropDownItemComponent = null;
    private _initiallySelectedItem: IgxDropDownItemComponent = null;
    private _focusedItem: IgxDropDownItemComponent = null;

    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
    @ViewChild(IgxToggleActionDirective) public toggleAction: IgxToggleActionDirective;
    @ContentChildren(IgxDropDownItemComponent, { read: IgxDropDownItemComponent }) public items: QueryList<IgxDropDownItemComponent>;
    @Output() public onSelection = new EventEmitter<ISelectionEventArgs>();

    constructor(private elementRef: ElementRef, private renderer: Renderer) { }

    get selectedItem(): IgxDropDownItemComponent {
        return this._selectedItem;
    }
    set selectedItem(item: IgxDropDownItemComponent) {
        if (item === this.selectedItem) {
            return;
        }

        this._selectedItem = item;
    }

    get initialSelectionChanged() {
        return this.selectedItem !== this._initiallySelectedItem;
    }

    @Input() public width = "100px";
    @Input() public height = "200px";

    @HostListener("keydown.Space", ["$event"])
    public onSpaceKeyDown(event) {
        const oldItem = this.selectedItem;
        this.selectedItem = this._focusedItem;
        this.fireOnSelection(oldItem, this.selectedItem, event);
        this.toggle.close(true);
    }

    @HostListener("keydown.Enter", ["$event"])
    public onEnterKeyDown(event) {
        const oldItem = this.selectedItem;
        this.selectedItem = this._focusedItem;
        this.fireOnSelection(oldItem, this.selectedItem, event);
        this.toggle.close(true);
    }

    @HostListener("keydown.Escape", ["$event"])
    public onEscapeKeyDown(event) {
        this.toggle.close(true);
    }

    @HostListener("keydown.ArrowDown", ["$event"])
    public onArrowDownKeyDown(event) {
        let focusedItemIndex = -1;
        if (this._focusedItem) {
            focusedItemIndex = this._focusedItem.index;
        }
        while (this.items.toArray()[focusedItemIndex + 1] &&
            (this.items.toArray()[focusedItemIndex + 1].isDisabled || this.items.toArray()[focusedItemIndex + 1].isHeader)) {
            focusedItemIndex++;
        }
        if (focusedItemIndex < this.items.length - 1) {
            if (this._focusedItem) {
                this._focusedItem.isFocused = false;
            }
            this._focusedItem = this.items.toArray()[focusedItemIndex + 1];
            this._focusedItem.isFocused = true;
        }

        const rect = this._focusedItem.element.nativeElement.getBoundingClientRect();
        const parentRect = this.toggle.element.getBoundingClientRect();
        if (parentRect.bottom < rect.bottom) {
            this.toggle.element.scrollTop += (rect.bottom - parentRect.bottom);
        }
    }

    @HostListener("keydown.ArrowUp", ["$event"])
    public onArrowUpKeyDown(event) {
        if (this._focusedItem) {
            let focusedItemIndex = this._focusedItem.index;
            while ((this.items.toArray()[focusedItemIndex - 1]) &&
                 (this.items.toArray()[focusedItemIndex - 1].isDisabled || this.items.toArray()[focusedItemIndex - 1].isHeader)) {
                focusedItemIndex--;
            }
            if (focusedItemIndex > 0) {
                this._focusedItem.isFocused = false;
                this._focusedItem = this.items.toArray()[focusedItemIndex - 1];
                this._focusedItem.isFocused = true;
            }

            const rect = this._focusedItem.element.nativeElement.getBoundingClientRect();
            const parentRect = this.toggle.element.getBoundingClientRect();
            if (parentRect.top > rect.top) {
                this.toggle.element.scrollTop -= (parentRect.top - rect.bottom + rect.height);
            }
        }
    }

    @HostListener("keydown.End", ["$event"])
    public onEndKeyDown(event) {
        let focusedItemIndex = (this.items.length - 1);
        while ((this.items.toArray()[focusedItemIndex]) && ((this.items.toArray()[focusedItemIndex]).isDisabled
            || (this.items.toArray()[focusedItemIndex]).isHeader)) {
                focusedItemIndex--;
            }
        if (focusedItemIndex < this.items.length - 1) {
                if (this._focusedItem) {
                    this._focusedItem.isFocused = false;
                }
                this._focusedItem = this.items.toArray()[focusedItemIndex];
                this._focusedItem.isFocused = true;
            }
        const rect = this._focusedItem.element.nativeElement.getBoundingClientRect();
        const parentRect = this.toggle.element.getBoundingClientRect();
        if (parentRect.bottom < rect.bottom) {
                this.toggle.element.scrollTop += (rect.bottom - parentRect.bottom);
            }
    }

    @HostListener("keydown.Home", ["$event"])
    public onHomeKeyDown(event) {
        let focusedItemIndex = 0;
        while ((this.items.toArray()[focusedItemIndex]) && ((this.items.toArray()[focusedItemIndex]).isDisabled
            || (this.items.toArray()[focusedItemIndex]).isHeader)) {
                focusedItemIndex++;
            }
        if (focusedItemIndex < this.items.length - 1) {
                if (this._focusedItem) {
                    this._focusedItem.isFocused = false;
                }
                this._focusedItem = this.items.toArray()[focusedItemIndex];
                this._focusedItem.isFocused = true;
            }
        const rect = this._focusedItem.element.nativeElement.getBoundingClientRect();
        const parentRect = this.toggle.element.getBoundingClientRect();
        if (parentRect.top > rect.top) {
                this.toggle.element.scrollTop -= (parentRect.top - rect.bottom + rect.height);
            }
    }

    ngOnInit() {
        this.toggleAction.target = this.toggle;
        this.toggleAction.closeOnOutsideClick = true;
    }

    ngAfterViewInit() {
        this.toggle.element.style.zIndex = 10000;
        this.toggle.element.style.position = "absolute";
        this.toggle.element.style.overflowY = "auto";
    }

    public onClose() {
        if (this._focusedItem) {
            this._focusedItem.isFocused = false;
        }
    }

    public onOpen() {
        this.elementRef.nativeElement.tabIndex = 0;
        this.elementRef.nativeElement.focus();
        if (this.selectedItem) {
            this._initiallySelectedItem = this.selectedItem;
            this._focusedItem = this.selectedItem;
            this.scrollToItem(this.selectedItem);
        }
    }

    public toggleDropDown() {
        this.toggle.toggle(true);
    }

    private scrollToItem(item: IgxDropDownItemComponent) {
        const totalHeight: number = this.items.reduce((sum, currentItem) => sum + currentItem.elementHeight, 0);
        let itemPosition = 0;
        itemPosition = this.items
            .filter((itemToFilter) => itemToFilter.index < item.index)
            .reduce((sum, currentItem) => sum + currentItem.elementHeight, 0);

        this.toggle.element.scrollTop = (Math.floor(itemPosition));
    }

    private fireOnSelection(oldItem: IgxDropDownItemComponent, newItem: IgxDropDownItemComponent, event?) {
        const args: ISelectionEventArgs = { oldSelection: oldItem, newSelection: newItem, event };
        this.onSelection.emit(args);
    }
}

@NgModule({
    declarations: [IgxDropDownComponent, IgxDropDownItemComponent],
    exports: [IgxDropDownComponent, IgxDropDownItemComponent],
    imports: [CommonModule, IgxToggleModule]
})
export class IgxDropDownModule { }
