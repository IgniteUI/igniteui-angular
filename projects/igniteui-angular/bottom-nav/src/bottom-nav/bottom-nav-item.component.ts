import { Component, ViewEncapsulation } from '@angular/core';
import { IgxTabItemDirective } from 'igniteui-angular/tabs';

@Component({
    selector: 'igx-bottom-nav-item',
    templateUrl: 'bottom-nav-item.component.html',
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: IgxTabItemDirective, useExisting: IgxBottomNavItemComponent }],
    standalone: true
})
export class IgxBottomNavItemComponent extends IgxTabItemDirective {
}
