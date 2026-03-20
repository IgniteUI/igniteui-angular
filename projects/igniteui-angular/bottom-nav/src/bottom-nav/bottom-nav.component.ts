import { Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IgxTabsBase, IgxTabsDirective } from 'igniteui-angular/tabs';


/** @hidden */
let NEXT_BOTTOM_NAV_ITEM_ID = 0;

/**
 * Bottom Navigation component enables the user to navigate among a number of contents displayed in a single view.
 *
 * @remarks
 * The Ignite UI for Angular Bottom Navigation component enables the user to navigate among a number of contents
 * displayed in a single view. The navigation through the contents is accomplished with the tab buttons located at bottom.
 */
@Component({
    selector: 'igx-bottom-nav',
    templateUrl: 'bottom-nav.component.html',
    providers: [{ provide: IgxTabsBase, useExisting: IgxBottomNavComponent }],
    imports: [NgTemplateOutlet]
})
export class IgxBottomNavComponent extends IgxTabsDirective {
    /** @hidden */
    public override disableAnimation = true;
    /** @hidden */
    protected override componentName = 'igx-bottom-nav';

    /** @hidden */
    protected getNextTabId() {
        return NEXT_BOTTOM_NAV_ITEM_ID++;
    }
}
