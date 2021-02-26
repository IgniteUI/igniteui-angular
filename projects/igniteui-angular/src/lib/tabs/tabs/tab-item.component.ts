import { Component } from '@angular/core';
import { IgxTabItemDirective } from '../tab-item.directive';

@Component({
    selector: 'igx-tab-item',
    templateUrl: 'tab-item.component.html',
    providers: [{ provide: IgxTabItemDirective, useExisting: IgxTabItemComponent }]
})
export class IgxTabItemComponent extends IgxTabItemDirective {

}
