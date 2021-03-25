import { Component, HostBinding } from '@angular/core';
import { IgxTabPanelDirective } from '../tab-panel.directive';
import { IgxTabPanelBase } from '../tabs.base';

@Component({
    selector: 'igx-bottom-nav-panel',
    templateUrl: 'bottom-nav-panel.component.html',
    providers: [{ provide: IgxTabPanelBase, useExisting: IgxBottomNavPanelComponent }]
})
export class IgxBottomNavPanelComponent extends IgxTabPanelDirective {
    /** @hidden */
    @HostBinding('class.igx-bottom-nav__panel')
    public defaultClass = true;
}
