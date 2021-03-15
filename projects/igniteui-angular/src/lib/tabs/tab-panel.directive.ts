import { Directive, ElementRef, HostBinding } from '@angular/core';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabPanelBase } from './tabs.base';

@Directive()
export abstract class IgxTabPanelDirective implements IgxTabPanelBase {

    /**
     * @hidden
     */
    @HostBinding('attr.role')
    public role = 'tabpanel';

    /** @hidden */
    constructor(public tab: IgxTabItemDirective, private elementRef: ElementRef) {
    }

    /** @hidden */
    public get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    };
}
