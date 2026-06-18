import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { IgxTooltipDirective } from './tooltip.directive';

@Component({
    selector: 'igx-tooltip',
    templateUrl: 'tooltip.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxTooltipDirective]
})

export class IgxTooltipComponent {

    @ViewChild(IgxTooltipDirective, { static: true })
    public tooltip: IgxTooltipDirective;

    public content: string;
}