import { Component, HostBinding } from '@angular/core';
import { IgxTabContentDirective } from '../tab-content.directive';
import { IgxTabContentBase } from '../tabs.base';
import { NgIf } from '@angular/common';

@Component({
    selector: 'igx-tab-content',
    templateUrl: 'tab-content.component.html',
    providers: [{ provide: IgxTabContentBase, useExisting: IgxTabContentComponent }],
    imports: [NgIf]
})
export class IgxTabContentComponent extends IgxTabContentDirective {
    /** @hidden */
    @HostBinding('class.igx-tabs__panel')
    public cssClass = true;
}
