import { Component, HostBinding } from '@angular/core';
import { IgxTabContentDirective } from '../tab-content.directive';
import { IgxTabContentBase } from '../tabs.base';

@Component({
    selector: 'igx-tab-content',
    templateUrl: 'tab-content.component.html',
    providers: [{ provide: IgxTabContentBase, useExisting: IgxTabContentComponent }]
})
export class IgxTabContentComponent extends IgxTabContentDirective {
    /** @hidden */
    @HostBinding('class.igx-tabs__panel')
    public cssClass = true;
}
