import { Directive } from '@angular/core';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabPanelNewBase } from './tabs-base';

@Directive()
export abstract class IgxTabPanelDirective implements IgxTabPanelNewBase {
    /** @hidden */
    constructor(public tab: IgxTabItemDirective) {
    }
}
