import { Component } from '@angular/core';
import { IgxTabsBase } from '../tabs.base';
import { IgxTabsDirective } from '../tabs.directive';


/** @hidden */
let NEXT_BOTTOM_NAV_ITEM_ID = 0;

@Component({
    selector: 'igx-bottom-nav',
    templateUrl: 'bottom-nav.component.html',
    providers: [{ provide: IgxTabsBase, useExisting: IgxBottomNavComponent }]
})
export class IgxBottomNavComponent extends IgxTabsDirective {
    /** @hidden */
    protected _disableAnimation = true;
    /** @hidden */
    protected componentName = 'igx-bottom-nav';

    /** @hidden */
    protected getNextTabId() {
        return NEXT_BOTTOM_NAV_ITEM_ID++;
    }
}
