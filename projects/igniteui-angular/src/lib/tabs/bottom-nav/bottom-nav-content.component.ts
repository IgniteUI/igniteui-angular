import { Component, HostBinding, ViewEncapsulation } from '@angular/core';
import { IgxTabContentDirective } from '../tab-content.directive';
import { IgxTabContentBase } from '../tabs.base';

@Component({
    selector: 'igx-bottom-nav-content',
    templateUrl: 'bottom-nav-content.component.html',
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: IgxTabContentBase, useExisting: IgxBottomNavContentComponent }],
    imports: []
})
export class IgxBottomNavContentComponent extends IgxTabContentDirective {
    /** @hidden */
    @HostBinding('class.igx-bottom-nav__panel')
    public defaultClass = true;
}
