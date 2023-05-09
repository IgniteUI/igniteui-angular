import { Component, ViewChild } from '@angular/core';
import { IgxTooltipDirective } from './tooltip.directive';

@Component({
    selector: 'igx-tooltip',
    templateUrl: 'tooltip.component.html',
    standalone: true,
    imports: [IgxTooltipDirective]
})

export class IgxTooltipComponent {

    @ViewChild(IgxTooltipDirective, { static: true })
    public tooltip: IgxTooltipDirective;

    public content: string;
}