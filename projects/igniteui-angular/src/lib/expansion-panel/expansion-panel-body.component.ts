import { Component, HostBinding, Inject, forwardRef } from '@angular/core';
import { trigger, transition, animate, style, AnimationEvent } from '@angular/animations';
import { IgxExpansionPanelComponent } from './expansion-panel.component';
import { EaseIn } from '../animations/easings';

const enter_entryParams = {
    height: '{{ enter_startHeight }}',
    opacity: `{{ enter_startOpacity }}`
};

const enter_endParams = {
    height: `{{ enter_endHeight }}`,
    opacity: `{{ enter_endOpacity }}`
};
const leave_entryParams = {
    height: '{{ leave_startHeight }}',
    opacity: `{{ leave_startOpacity }}`
};

const leave_endParams = {
    height: `{{ leave_endHeight }}`,
    opacity: `{{ leave_endOpacity }}`
};

const defaultEntryParams = {
    enter_duration: '300ms',
    enter_delay: '0s',
    enter_easing: EaseIn.quad,
    enter_startHeight: '0px',
    enter_startOpacity: 0.5,
    enter_endHeight: '*',
    enter_endOpacity: 1
};

const defaultExitParams = {
    leave_duration: '300ms',
    leave_delay: '0s',
    leave_easing: EaseIn.quad,
    leave_startHeight: '*',
    leave_startOpacity: 1,
    leave_endHeight: '0px',
    leave_endOpacity: 0.5
};

@Component({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-body',
    template: `<div *ngIf="!panel.collapsed"
        [@enterAnimation]="{ value: '', params: animationParams }"
        (@enterAnimation.done)="emitEvents($event)">
            <ng-content></ng-content>
        </div>`,
    animations: [
        trigger('enterAnimation', [
            transition(':enter', [
                style(enter_entryParams),
                animate('{{ enter_duration }} {{ enter_delay }} {{ enter_easing }}',
                style(enter_endParams))
            ], { params: defaultEntryParams }),
            transition(':leave', [
                style(leave_entryParams),
                animate('{{ leave_duration }} {{ leave_delay }} {{ leave_easing }}',
                style(leave_endParams))
            ], { params: defaultExitParams })
        ])
    ]
})
export class IgxExpansionPanelBodyComponent {
    constructor(@Inject(forwardRef(() => IgxExpansionPanelComponent)) public panel: IgxExpansionPanelComponent) {
    }
    @HostBinding('class.igx-expansion-panel__header-body')
    public cssClass = `igx-expansion-panel__header-body`;

    public emitEvents(event: AnimationEvent) {
        if (event.phaseName === 'done') {
            if (event.fromState === 'void') {
                this.panel.onExpanded.emit({event });
            } else if (event.toState === 'void') {
                this.panel.onCollapsed.emit({ event });
            }
        }
    }
    public get animationParams() {
        const concatParams = {};
        const openAnimation = this.panel.animationSettings.openAnimation.options.params;
        Object.keys(openAnimation).map( key => {
            concatParams[`enter_${key}`] = openAnimation[key];
        });
        const closeAnimation = this.panel.animationSettings.closeAnimation.options.params;
        Object.keys(closeAnimation).map( key => {
            concatParams[`leave_${key}`] = closeAnimation[key];
        });
        return concatParams;
    }
}
