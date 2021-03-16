import { Component } from '@angular/core';
import { IgxTabsBase } from '../tabs.base';
import { IgxTabsDirective } from '../tabs.directive';

@Component({
    selector: 'igx-bottom-nav',
    templateUrl: 'bottom-nav.component.html',
    providers: [{ provide: IgxTabsBase, useExisting: IgxBottomNavComponent }]
})
export class IgxBottomNavComponent extends IgxTabsDirective {
    protected _disableAnimation = true;
    protected componentName = 'igx-bottom-nav';
}
