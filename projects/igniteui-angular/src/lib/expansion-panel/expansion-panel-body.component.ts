import { Component, HostBinding, Inject, forwardRef } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { IgxExpansionPanelComponent } from './expansion-panel.component';
import { EaseIn } from '../animations/easings';

const defaultDurationParams = {
    duration: '300ms',
    delay: '0s',
    easing: EaseIn.quad
};

const defaultEntryParams = {
    ...defaultDurationParams,
    enterStartHeight: '0px',
    enterStartOpacity: 0.5,
    enterEndHeight: '*',
    enterEndOpacity: 1
};

const defaultExitParams = {
    ...defaultDurationParams,
    leaveStartHeight: '*',
    leaveStartOpacity: 1,
    leaveEndHeight: '0px',
    leaveEndOpacity: 0.5
};

@Component({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-body',
    template: '<div *ngIf="!panel.collapsed" [@enterAnimation]><ng-content></ng-content></div>',
    animations: [
        trigger('enterAnimation', [
            transition(':enter', [
                style({ height: '{{ enterStartHeight }}', opacity: `{{ enterStartOpacity }}` }),
                animate('{{ duration }} {{ delay }} {{ easing }}',
                style({ height: `{{ enterEndHeight }}`, opacity: `{{ enterEndOpacity }}` }))
            ], { params: defaultEntryParams }),
            transition(':leave', [
                style({ height: `{{leaveStartHeight }}`, opacity: `{{ leaveStartOpacity }}` }),
                animate('{{ duration }} {{ delay }} {{ easing }}',
                style({ height: '{{ leaveEndHeight }}', opacity: `{{ leaveEndOpacity }}` }))
            ], { params: defaultExitParams })
        ])
    ]
})
export class IgxExpansionPanelBodyComponent {
    constructor(@Inject(forwardRef(() => IgxExpansionPanelComponent)) public panel: IgxExpansionPanelComponent) {
    }
    @HostBinding('class.igx-expansion-panel__header-body')
    public cssClass = `igx-expansion-panel__header-body`;
}
