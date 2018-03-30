import { CommonModule } from "@angular/common";
import {
    Component,
    ContentChild,
    ElementRef,
    HostBinding,
    Input,
    HostListener
} from "@angular/core";

import { IgxBadgeModule } from "../badge/badge.component";
import { IgxIconModule } from "../icon";
import { IgxTabsComponent, IgxTabsGroupComponent } from "./tabs.component";

@Component({
    selector: "igx-tab-item",
    templateUrl: "tab-item.component.html"
})

export class IgxTabItemComponent {

    @HostBinding("attr.role") public role = "tab";

    @Input() public relatedGroup: IgxTabsGroupComponent;

    private _nativeTabItem;

    private _changesCount = 0; // changes and updates accordingly applied to the tab.

    @HostListener("click", ["$event"]) 
    public onClick(event){
        const tabElement = this._nativeTabItem.nativeElement;
        const viewPortOffsetWidth = this._tabs.viewPort.nativeElement.offsetWidth;

        if (tabElement.offsetLeft < this._tabs.offset) {
            this._tabs.scrollElement(tabElement, false);
        } else if (tabElement.offsetLeft + tabElement.offsetWidth > viewPortOffsetWidth + this._tabs.offset) {
            this._tabs.scrollElement(tabElement, true);
        }

        this._tabs.selectedIndicator.nativeElement.style.width = `${tabElement.offsetWidth}px`;
        this._tabs.selectedIndicator.nativeElement.style.transform = `translate(${tabElement.offsetLeft}px)`;
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

    constructor(private _tabs: IgxTabsComponent, private _element: ElementRef) {
        this._nativeTabItem = _element;
    }

    public select() {
        this.relatedGroup.select();
    }
}
