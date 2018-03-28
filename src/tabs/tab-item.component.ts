import { CommonModule } from "@angular/common";
import {
    Component,
    ContentChild,
    ElementRef,
    HostBinding,
    Input
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
