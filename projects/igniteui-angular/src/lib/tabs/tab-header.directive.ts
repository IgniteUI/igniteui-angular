
import { Directive, ElementRef, HostListener } from '@angular/core';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabHeaderBase, IgxTabsBase } from './tabs.base';

@Directive()
export abstract class IgxTabHeaderDirective implements IgxTabHeaderBase {

    /** @hidden */
    constructor(protected tabs: IgxTabsBase, public tab: IgxTabItemDirective, private elementRef: ElementRef) {
    }

    /** @hidden */
    @HostListener('click')
    public onClick() {
        this.tabs.selectTab(this.tab, true);
    }

    /** @hidden */
    public get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    };
}
