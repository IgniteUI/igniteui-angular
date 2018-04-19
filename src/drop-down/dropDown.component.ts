import { CommonModule } from "@angular/common";
import {
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostListener,
    NgModule,
    OnInit,
    Output,
    QueryList,
    Renderer,
    ViewChild,
    ViewChildren
} from "@angular/core";
import { IgxToggleDirective, IgxToggleModule } from "../directives/toggle/toggle.directive";
import { IgxDropDownItemComponent } from "./dropDownItem.component";

@Component({
    selector: "igx-drop-down",
    templateUrl: "./dropDown.component.html",
    styles: [".igx-toggle { background-color: yellow; }"]
})
export class IgxDropDownComponent implements OnInit {
    private _selectedItem: IgxDropDownItemComponent = null;
    private _initiallySelectedItem: IgxDropDownItemComponent = null;

    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
    @ContentChildren(IgxDropDownItemComponent, { read: IgxDropDownItemComponent }) public items: QueryList<IgxDropDownItemComponent>;
    @Output() public itemClicked = new EventEmitter<IgxDropDownItemComponent>();

    constructor(private elementRef: ElementRef, private renderer: Renderer) { }

    get selectedItem(): IgxDropDownItemComponent {
        return this._selectedItem;
    }

    set selectedItem(item: IgxDropDownItemComponent) {
        this._selectedItem = item;
    }

    public ngOnInit() {
    }

    @HostListener("blur", ["$event"])
    public onBlur(event) {
        this.toggle.close(true);
    }

    public toggleDropDown() {
        if (this.toggle.collapsed) {
            this.toggle.open(true);
        } else {
            this.toggle.close(true);
        }
    }

    private scrollToItem(item: IgxDropDownItemComponent) {
        const totalHeight: number = this.items.reduce((sum, currentItem) => sum + currentItem.elementHeight, 0);
        let itemPosition = 0;
        itemPosition = this.items
            .filter((itemToFilter) => itemToFilter.index < item.index)
            .reduce((sum, currentItem) => sum + currentItem.elementHeight, 0);

        itemPosition += item.elementHeight / 2;
        this.toggle.element.scrollTop = (Math.floor(itemPosition));
    }

    public dropDown() {
        this.elementRef.nativeElement.tabIndex = 0;
        this.elementRef.nativeElement.focus();
        if (this._selectedItem) {
            this._initiallySelectedItem = this._selectedItem;
            this.scrollToItem(this._selectedItem);
        }
    }

    @HostListener("keydown.Space", ["$event"])
    public onSpaceKeyDown(event) {
        this.toggle.close(true);
    }

    @HostListener("keydown.Enter", ["$event"])
    public onEnterKeyDown(event) {
        this.toggle.close(true);
    }

    @HostListener("keydown.Escape", ["$event"])
    public onEscapeKeyDown(event) {
        this.selectedItem = this._initiallySelectedItem;
        this.toggle.close(true);
    }

    @HostListener("keydown.ArrowDown", ["$event"])
    public onArrowDownKeyDown(event) {
        let selectedItemIndex = -1;
        if (this.selectedItem) {
            selectedItemIndex = this.selectedItem.index;
        }
        if (selectedItemIndex < this.items.length - 1) {
            this.selectedItem = this.items.toArray()[selectedItemIndex + 1];
        }
    }

    @HostListener("keydown.ArrowUp", ["$event"])
    public onArrowUpKeyDown(event) {
        if (this.selectedItem) {
            const selectedItemIndex = this.selectedItem.index;
            if (selectedItemIndex > 0) {
                this.selectedItem = this.items.toArray()[selectedItemIndex - 1];
            }
        }
    }
}

@NgModule({
    declarations: [IgxDropDownComponent, IgxDropDownItemComponent],
    exports: [IgxDropDownComponent, IgxDropDownItemComponent],
    imports: [CommonModule, IgxToggleModule]
})
export class IgxDropDownModule { }
