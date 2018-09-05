import { Directive, HostBinding, Input, Host, Component } from '@angular/core';
import { IgxExpansionPanelComponent } from './expansion-panel.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

let NEXT_ID = 0;

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-header'
})
export class IgxExpansionPanelHeaderDirective {
}
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-title'
})
export class IgxExpansionPanelTitleDirective {
    @Input()
    @HostBinding('attr.id')
    public id = `igx-expansion-panel-header-title-${NEXT_ID++}`;

    @HostBinding('class.igx-expansion-panel__header-title')
    public cssClass = `igx-expansion-panel__header-title`;
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-description'
})
export class IgxExpansionPanelDescriptionDirective {
    @HostBinding('class.igx-expansion-panel__header-description')
    public cssClass = `igx-expansion-panel__header-description`;
}

@Component({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-body',
    template: '<div *ngIf="!panel.collapsed" [@enterAnimation]><ng-content></ng-content></div>',
    animations: [
        trigger('enterAnimation', [
            transition(':enter', [
                style({height: '0px', opacity: 0}),
                animate('300ms', style({height: '*', opacity: 1}))
              ]),
              transition(':leave', [
                style({height: '*', opacity: 1}),
                animate('300ms', style({height: '0px', opacity: 0}))
              ])
        ])
    ]
})
export class IgxExpansionPanelBodyComponent {
    constructor(@Host() public panel: IgxExpansionPanelComponent) {
    }
    @HostBinding('class.igx-expansion-panel__header-body')
    public cssClass = `igx-expansion-panel__header-body`;
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-icon'
})
export class IgxExpansionPanelIconDirective {
}
