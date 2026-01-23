import {Component, HostBinding, ViewEncapsulation} from '@angular/core';
import { IgxTabContentDirective } from '../../tab-content.directive';
import { IgxTabContentBase } from '../../tabs.base';

@Component({
    selector: 'igx-tab-content',
    templateUrl: 'tab-content.component.html',
    styleUrl: 'tab-content.component.css',
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: IgxTabContentBase, useExisting: IgxTabContentComponent }],
})
export class IgxTabContentComponent extends IgxTabContentDirective {
    /** @hidden */
    @HostBinding('class.igx-tabs-content__inner')
    public cssClass = true;
}
