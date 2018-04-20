import { CommonModule } from "@angular/common";
import {
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostListener,
    NgModule,
    Output,
    QueryList,
    Renderer,
    ViewChild,
    ViewChildren,
    OnInit,
    HostBinding,
    Input
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
export class IgxDropDownComponent implements OnInit {
    private _selectedItem: IgxDropDownItemComponent = null;
    private _initiallySelectedItem: IgxDropDownItemComponent = null;
    private _focusedItem: IgxDropDownItemComponent = null;
    public _initialSelectionChanged = false;
    public overflowY = "auto";

    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
    @ViewChild(IgxToggleActionDirective) public toggleAction: IgxToggleActionDirective;
    @ContentChildren(IgxDropDownItemComponent, { read: IgxDropDownItemComponent }) public items: QueryList<IgxDropDownItemComponent>;
    @Output() public itemClicked = new EventEmitter<IgxDropDownItemComponent>();
    @Output() public onSelection = new EventEmitter<ISelectionEventArgs>();
    @Input() public width = "80px";
    @Input() public height = "120px";

    constructor(private elementRef: ElementRef, private renderer: Renderer) { }

    get selectedItem(): IgxDropDownItemComponent {
        return this._selectedItem;
    }

    set selectedItem(item: IgxDropDownItemComponent) {
        this._selectedItem = item;
    }

    @HostListener("keydown.Space", ["$event"])
    public onSpaceKeyDown(event) {
        this._initialSelectionChanged = true;
        this.selectedItem = this._focusedItem;
        this.toggle.close(true);
    }

    @HostListener("keydown.Enter", ["$event"])
    public onEnterKeyDown(event) {
        this._initialSelectionChanged = true;
        this.selectedItem = this._focusedItem;
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
        if (focusedItemIndex < this.items.length - 1) {
            this._focusedItem.isFocused = false;
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
            const focusedItemIndex = this._focusedItem.index;
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

    ngOnInit() {
        this.toggleAction.target = this.toggle;
        this.toggleAction.closeOnOutsideClick = false;
    }

    public close() {
        if (!this._initialSelectionChanged) {
            const oldSelection = this.selectedItem;
            this.selectedItem = this._initiallySelectedItem;
            const args: ISelectionEventArgs = { oldSelection, newSelection: this.selectedItem, event };
            this.onSelection.emit(args);
        }
        this._initialSelectionChanged = false;
        this._focusedItem.isFocused = false;
    }

    public open() {
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
}

@NgModule({
    declarations: [IgxDropDownComponent, IgxDropDownItemComponent],
    exports: [IgxDropDownComponent, IgxDropDownItemComponent],
    imports: [CommonModule, IgxToggleModule]
})
export class IgxDropDownModule { }
