import { Directive, ElementRef } from '@angular/core';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabPanelNewBase } from './tabs-base';

@Directive()
export abstract class IgxTabPanelDirective implements IgxTabPanelNewBase {
    /** @hidden */
    constructor(public tab: IgxTabItemDirective, private elementRef: ElementRef) {
    }

    /** @hidden */
    public get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    };
}
