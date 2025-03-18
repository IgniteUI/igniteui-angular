import { Component, ViewEncapsulation } from '@angular/core';
import { IgxTabItemDirective } from '../tab-item.directive';

@Component({
    selector: 'igx-bottom-nav-item',
    templateUrl: 'bottom-nav-item.component.html',
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: IgxTabItemDirective, useExisting: IgxBottomNavItemComponent }],
    standalone: true
})
export class IgxBottomNavItemComponent extends IgxTabItemDirective {
}
