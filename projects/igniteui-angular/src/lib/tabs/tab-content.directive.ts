import { Directive, ElementRef, HostBinding } from '@angular/core';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabContentBase } from './tabs.base';

@Directive()
export abstract class IgxTabContentDirective implements IgxTabContentBase {

    /** @hidden */
    @HostBinding('attr.role')
    public role = 'tabpanel';

    /** @hidden */
    constructor(public tab: IgxTabItemDirective, private elementRef: ElementRef<HTMLElement>) {
    }

    /** @hidden */
    @HostBinding('attr.tabindex')
    public get tabIndex() {
        return this.tab.selected ? 0 : -1;
    }

    /** @hidden */
    @HostBinding('style.z-index')
    public get zIndex() {
        return this.tab.selected ? 'auto' : -1;
    }

    /** @hidden */
    public get nativeElement() {
        return this.elementRef.nativeElement;
    };
}
