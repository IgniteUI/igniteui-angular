import { Component, HostBinding } from '@angular/core';
import { IgxTabContentDirective } from '../tab-content.directive';
import { IgxTabContentBase } from '../tabs.base';

@Component({
    selector: 'igx-bottom-nav-content',
    templateUrl: 'bottom-nav-content.component.html',
    providers: [{ provide: IgxTabContentBase, useExisting: IgxBottomNavContentComponent }]
})
export class IgxBottomNavContentComponent extends IgxTabContentDirective {
    /** @hidden */
    @HostBinding('class.igx-bottom-nav__panel')
    public defaultClass = true;
}
