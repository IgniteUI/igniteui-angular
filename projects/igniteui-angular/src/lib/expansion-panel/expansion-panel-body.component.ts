import { Component, HostBinding, Inject, forwardRef, ElementRef } from '@angular/core';
import { IgxExpansionPanelComponent } from './expansion-panel.component';

@Component({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-body',
    template: `<div style="display:flex">
            <ng-content></ng-content>
        </div>`
})
export class IgxExpansionPanelBodyComponent {
    constructor(@Inject(forwardRef(() => IgxExpansionPanelComponent))
    public panel: IgxExpansionPanelComponent, public element: ElementRef) {
    }
    @HostBinding('class.igx-expansion-panel__header-body')
    public cssClass = `igx-expansion-panel__header-body`;

}
