import { AfterViewInit, ContentChildren, Directive, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabsBaseNew } from './tabs-base';

@Directive()
export abstract class IgxTabsDirective implements IgxTabsBaseNew, AfterViewInit {
    @Output()
    public selectedIndexChange = new EventEmitter<number>();

    @Input()
    public get selectedIndex(): number {
        return this._selectedIndex;
    }

    public set selectedIndex(value: number) {
        if (this._selectedIndex !== value) {
            console.log(`selectedIndex: ${value}`);

            this._selectedIndex = value;
            this.updateSelectedTabs();
            this.selectedIndexChange.emit(this._selectedIndex);
        }
    }

    /** @hidden */
    @ContentChildren(IgxTabItemDirective)
    public tabs: QueryList<IgxTabItemDirective>;

    private _selectedIndex = 0;

    /** @hidden */
    public ngAfterViewInit(): void {
        if (this._selectedIndex === -1) {
            this.tabs.some((tab, i) => {
                if (tab.selected) {
                    this._selectedIndex = i;
                }
                return tab.selected;
            });
        }

        // Use promise to avoid expression changed after check error
        Promise.resolve().then(() => {
            this.updateSelectedTabs();
        });
    }

    /** @hidden */
    public selectTab(tab: IgxTabItemDirective, selected: boolean): void {
        if (!this.tabs) {
            return;
        }

        const tabs = this.tabs.toArray();

        if (selected) {
            const index = tabs.indexOf(tab);
            this.selectedIndex = index;
        } else {
            if (tabs.every(t => !t.selected)) {
                this.selectedIndex = -1;
            }
        }
    }

    private updateSelectedTabs() {
        if (!this.tabs) {
            return;
        }

        const tabs = this.tabs.toArray();

        if (this.tabs) {
            // First select the new tab
            if (this._selectedIndex >= 0 && this._selectedIndex < tabs.length) {
                tabs[this._selectedIndex].selected = true;
            }
            // Then unselect the other tabs
            this.tabs.forEach((tab, i) => {
                if (i !== this._selectedIndex) {
                    tab.selected = false;
                }
            });
        }
    }
}
