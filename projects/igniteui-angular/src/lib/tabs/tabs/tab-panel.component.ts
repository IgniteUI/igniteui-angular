import { Component } from '@angular/core';
import { IgxTabPanelDirective } from '../tab-panel.directive';
import { IgxTabPanelBase } from '../tabs-base';

@Component({
    selector: 'igx-tab-panel',
    templateUrl: 'tab-panel.component.html',
    styles: [
        `:host {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
        }`
    ],
    providers: [{ provide: IgxTabPanelBase, useExisting: IgxTabPanelComponent }]
})
export class IgxTabPanelComponent extends IgxTabPanelDirective {

}
