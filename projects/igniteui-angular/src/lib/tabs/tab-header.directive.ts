
import { Directive, ElementRef, HostBinding, HostListener } from '@angular/core';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabHeaderBase, IgxTabsBase } from './tabs.base';

@Directive()
export abstract class IgxTabHeaderDirective implements IgxTabHeaderBase {

    /** @hidden */
    @HostBinding('attr.role')
    public role = 'tab';

    /** @hidden */
    constructor(protected tabs: IgxTabsBase, public tab: IgxTabItemDirective, private elementRef: ElementRef) {
    }

    /** @hidden */
    @HostListener('click')
    public onClick() {
        this.tabs.selectTab(this.tab, true);
    }

    /** @hidden */
    @HostBinding('attr.tabindex')
    public get tabIndex() {
        return this.tab.selected ? 0 : -1;
    }

    /** @hidden */
    @HostBinding('attr.aria-selected')
    public get ariaSelected() {
        return this.tab.selected ? 'true' : 'false';
    }

    /** @hidden */
    public get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    };
}
