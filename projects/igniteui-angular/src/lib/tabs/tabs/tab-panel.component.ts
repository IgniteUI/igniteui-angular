import { Component, HostBinding } from '@angular/core';
import { IgxTabPanelDirective } from '../tab-panel.directive';
import { IgxTabPanelBase } from '../tabs.base';

@Component({
    selector: 'igx-tab-panel',
    templateUrl: 'tab-panel.component.html',
    providers: [{ provide: IgxTabPanelBase, useExisting: IgxTabPanelComponent }]
})
export class IgxTabPanelComponent extends IgxTabPanelDirective {
    /** @hidden */
    @HostBinding('class.igx-tabs__panel')
    public cssClass = true;
}
