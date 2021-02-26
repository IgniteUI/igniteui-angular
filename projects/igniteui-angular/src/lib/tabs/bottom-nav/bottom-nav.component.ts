import { Component } from '@angular/core';
import { IgxTabsBaseNew } from '../tabs-base';
import { IgxTabsDirective } from '../tabs.directive';

@Component({
    selector: 'igx-bottom-nav-new',
    templateUrl: 'bottom-nav.component.html',
    providers: [{ provide: IgxTabsBaseNew, useExisting: IgxBottomNavNewComponent }]
})
export class IgxBottomNavNewComponent extends IgxTabsDirective {
    // TODO Disable animations by default
    // public animationType: CarouselAnimationType = CarouselAnimationType.none;
}
