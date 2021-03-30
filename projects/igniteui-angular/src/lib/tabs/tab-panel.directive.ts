import { Directive, ElementRef, HostBinding } from '@angular/core';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabPanelBase } from './tabs.base';

@Directive()
export abstract class IgxTabPanelDirective implements IgxTabPanelBase {

    /** @hidden */
    @HostBinding('attr.role')
    public role = 'tabpanel';

    /** @hidden */
    constructor(public tab: IgxTabItemDirective, private elementRef: ElementRef) {
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
    public get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    };
}
