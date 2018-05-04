import { CommonModule } from "@angular/common";
import {
    AfterViewInit,
    Component,
    ContentChildren,
    EventEmitter,
    HostListener,
    Input,
    NgModule,
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

@Component({
    selector: "igx-drop-down",
    templateUrl: "./drop-down.component.html"
})
export class IgxDropDownComponent implements AfterViewInit {
    private _initiallySelectedItem: IgxDropDownItemComponent = null;
    private _focusedItem: IgxDropDownItemComponent = null;
    private _defaultWidth = "128px";
    private _defaultHeight = "200px";
    private _id = "DropDown_0";

    @ViewChild(IgxToggleDirective) public toggleDirective: IgxToggleDirective;
    @ContentChildren(IgxDropDownItemComponent, { read: IgxDropDownItemComponent }) public items: QueryList<IgxDropDownItemComponent>;

    @Output() public onSelection = new EventEmitter<ISelectionEventArgs>();
    @Output() public onOpen = new EventEmitter();
    @Output() public onClose = new EventEmitter();

    @Input() public width = this._defaultWidth;
    @Input() public height = this._defaultHeight;
    @Input() public allowItemsFocus = true;

    constructor(
        private selectionAPI: IgxSelectionAPIService) { }

    get id(): string {
        return this._id;
    }
    @Input()
    set id(value: string) {
        this._id = value;
        this.toggleDirective.id = value;
    }

    get selectedItem(): IgxDropDownItemComponent {
        const selection = this.selectionAPI.get_selection(this.id);
        return selection && selection.length > 0 ? selection[0] as IgxDropDownItemComponent : null;
    }

    setSelectedItem(index: number) {
        if (index < 0 || index >= this.items.length) {
            return;
        }

        const newSelection = this.items.toArray().find((item) => item.index === index);
        if (newSelection.isDisabled || newSelection.isHeader) {
            return;
        }

        this.changeSelectedItem(newSelection);
    }

    focusFirst() {
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

        // const rect = this._focusedItem.element.nativeElement.getBoundingClientRect();
        // const parentRect = this.toggle.element.getBoundingClientRect();
        // if (parentRect.top > rect.top) {
        //     this.toggle.element.scrollTop -= (parentRect.top - rect.bottom + rect.height);
        // }
    }

    focusLast() {
        let focusedItemIndex = (this.items.length - 1);
        while ((this.items.toArray()[focusedItemIndex]) && ((this.items.toArray()[focusedItemIndex]).isDisabled
            || (this.items.toArray()[focusedItemIndex]).isHeader)) {
            focusedItemIndex--;
        }
        if (focusedItemIndex < this.items.length) {
            if (this._focusedItem) {
                this._focusedItem.isFocused = false;
            }
            this._focusedItem = this.items.toArray()[focusedItemIndex];
            this._focusedItem.isFocused = true;
        }

        // const rect = this._focusedItem.element.nativeElement.getBoundingClientRect();
        // const parentRect = this.toggle.element.getBoundingClientRect();
        // if (parentRect.bottom < rect.bottom) {
        //     this.toggle.element.scrollTop += (rect.bottom - parentRect.bottom);
        // }
    }

    focusNext() {
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
            while ((this.items.toArray()[focusedItemIndex - 1]) &&
                (this.items.toArray()[focusedItemIndex - 1].isDisabled || this.items.toArray()[focusedItemIndex - 1].isHeader)) {
                focusedItemIndex--;
            }
            if (focusedItemIndex > 0) {
                this._focusedItem.isFocused = false;
                this._focusedItem = this.items.toArray()[focusedItemIndex - 1];

                const elementRect = this._focusedItem.element.nativeElement.getBoundingClientRect();
                const parentRect = this.toggleDirective.element.getBoundingClientRect();
                if (parentRect.top > elementRect.top) {
                    this.toggleDirective.element.scrollTop -= (parentRect.top - elementRect.top);
                }

                this._focusedItem.isFocused = true;
            }
        }
    }

    ngAfterViewInit() {
        this.toggleDirective.id = this.id;
        this.toggleDirective.element.style.zIndex = 1;
        this.toggleDirective.element.style.position = "absolute";
        this.toggleDirective.element.style.overflowY = "auto";

        if (!this.selectedItem && this.items.length > 0) {
            this.setSelectedItem(0);
        }
        this._initiallySelectedItem = this.selectedItem;
    }

    onToggleClose() {
        if (this._focusedItem) {
            this._focusedItem.isFocused = false;
        }

        this.onClose.emit();
    }

    onToggleOpen() {
        this._focusedItem = this.selectedItem;
        if (this._focusedItem) {
            this._focusedItem.isFocused = true;
        }
        this.onOpen.emit();
    }

    onToggleOpening() {
        this.scrollToItem(this.selectedItem);
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
        const totalHeight: number = this.items.reduce((sum, currentItem) => sum + currentItem.elementHeight, 0);
        let itemPosition = 0;
        itemPosition = this.items
            .filter((itemToFilter) => itemToFilter.index < item.index)
            .reduce((sum, currentItem) => sum + currentItem.elementHeight, 0);

        // TODO: find how to calculate height without padding. We are remove padding now by -16
        const dropDownHeight = this.toggleDirective.element.clientHeight - 16;
        itemPosition -= dropDownHeight / 2;
        itemPosition += item.elementHeight / 2;

        return Math.floor(itemPosition);
    }
}

@NgModule({
    declarations: [IgxDropDownComponent, IgxDropDownItemComponent],
    exports: [IgxDropDownComponent, IgxDropDownItemComponent],
    imports: [CommonModule, IgxToggleModule]
})
export class IgxDropDownModule { }
