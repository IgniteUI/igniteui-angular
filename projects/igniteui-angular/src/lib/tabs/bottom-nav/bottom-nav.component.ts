import { Component } from '@angular/core';
import { IgxTabsBase } from '../tabs.base';
import { IgxTabsDirective } from '../tabs.directive';


/** @hidden */
let NEXT_BOTTOM_NAV_ITEM_ID = 0;

/**
 * Bottom Navigation component enables the user to navigate among a number of contents displayed in a single view.
 *
 * @igxModule IgxBottomNavModule
 *
 * @igxTheme igx-bottom-nav-theme
 *
 * @igxKeywords bottom navigation
 *
 * @igxGroup Layouts
 *
 * @remarks
 * The Ignite UI for Angular Bottom Navigation component enables the user to navigate among a number of contents
 * displayed in a single view. The navigation through the contents is accomplished with the tab buttons located at bottom.
 *
 * @example
 * ```html
 * <igx-bottom-nav>
 *     <igx-bottom-nav-item>
           <igx-bottom-nav-header>
               <igx-icon igxBottomNavHeaderIcon>folder</igx-icon>
               <span igxBottomNavHeaderLabel>Tab 1</span>
           </igx-bottom-nav-header>
           <igx-bottom-nav-content>
               Content 1
           </igx-bottom-nav-content>
       </igx-bottom-nav-item>
       ...
 * </igx-bottom-nav>
 * ```
 */
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
