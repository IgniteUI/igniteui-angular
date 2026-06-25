import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IgxTabItemDirective } from '../tab-item.directive';

@Component({
    selector: 'igx-tab-item',
    templateUrl: 'tab-item.component.html',
    providers: [{ provide: IgxTabItemDirective, useExisting: IgxTabItemComponent }],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class IgxTabItemComponent extends IgxTabItemDirective {

}
