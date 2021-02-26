import { Component } from '@angular/core';
import { IgxTabItemDirective } from '../tab-item.directive';

@Component({
    selector: 'igx-bottom-nav-item',
    templateUrl: 'bottom-nav-item.component.html',
    providers: [{ provide: IgxTabItemDirective, useExisting: IgxBottomNavItemComponent }]
})
export class IgxBottomNavItemComponent extends IgxTabItemDirective {
}
