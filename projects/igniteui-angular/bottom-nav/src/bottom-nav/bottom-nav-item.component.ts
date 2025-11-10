import { Component } from '@angular/core';
import { IgxTabItemDirective } from 'igniteui-angular/tabs';

@Component({
    selector: 'igx-bottom-nav-item',
    templateUrl: 'bottom-nav-item.component.html',
    providers: [{ provide: IgxTabItemDirective, useExisting: IgxBottomNavItemComponent }],
    standalone: true
})
export class IgxBottomNavItemComponent extends IgxTabItemDirective {
}
