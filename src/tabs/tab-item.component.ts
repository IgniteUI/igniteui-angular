import { CommonModule } from "@angular/common";
import {
    Component,
    ContentChild,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    Input
} from "@angular/core";

import { IgxTabsGroupComponent } from "./tabs-group.component";
import { IgxTabsComponent } from "./tabs.component";

@Component({
    selector: "igx-tab-item",
    templateUrl: "tab-item.component.html"
})

export class IgxTabItemComponent {
    private _nativeTabItem;
    private _changesCount = 0; // changes and updates accordingly applied to the tab.

    @Input()
    public relatedGroup: IgxTabsGroupComponent;

    @HostBinding("attr.role")
    public role = "tab";

    @HostBinding("attr.tabindex")
    public tabindex;

    @HostListener("click", ["$event"])
    public onClick(event) {
        this.select();
    }

    @HostListener("window:resize", ["$event"])
    public onResize(event) {
        if (this.isSelected) {
            this._tabs.selectedIndicator.nativeElement.style.width = `${this.nativeTabItem.nativeElement.offsetWidth}px`;
            this._tabs.selectedIndicator.nativeElement.style.transform = `translate(${this.nativeTabItem.nativeElement.offsetLeft}px)`;
        }
    }

    get changesCount(): number {
        return this._changesCount;
    }

    get nativeTabItem() {
        return this._nativeTabItem;
    }

    get isDisabled(): boolean {
        const group = this.relatedGroup;

        if (group) {
            return group.isDisabled;
        }
    }

    get isSelected(): boolean {
        const group = this.relatedGroup;

        if (group) {
            return group.isSelected;
        }
    }

    get index(): number {
        return this._tabs.tabs.toArray().indexOf(this);
    }

    constructor(@Inject(forwardRef(() => IgxTabsComponent)) private _tabs: IgxTabsComponent, private _element: ElementRef) {
        this._nativeTabItem = _element;
    }

    public select(focusDelay = 50) {
        this.relatedGroup.select(focusDelay);
    }
}
