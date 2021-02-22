import { Component, ViewChild } from '@angular/core';
import {
    IgxTooltipTargetDirective, IgxTooltipDirective,
    ITooltipShowEventArgs, ITooltipHideEventArgs
} from '../directives/tooltip/tooltip.directive';

@Component({
    template: `
        <div class="dummyDiv">dummy div for touch tests</div>
        <button [igxTooltipTarget]="tooltipRef"
                (tooltipShow)="showing($event)" (tooltipHide)="hiding($event)"
                style="margin: 200px">
            Hover me
        </button>
        <div igxTooltip #tooltipRef="tooltip">
            Hello, I am a tooltip!
        </div>
        `
})
export class IgxTooltipSingleTargetComponent {
    @ViewChild(IgxTooltipDirective, { static: true }) public tooltip: IgxTooltipDirective;
    @ViewChild(IgxTooltipTargetDirective, { static: true }) public tooltipTarget: IgxTooltipTargetDirective;
    public cancelShowing = false;
    public cancelHiding = false;

    public showing(args: ITooltipShowEventArgs) {
        if (this.cancelShowing) {
            args.cancel = true;
        }
    }

    public hiding(args: ITooltipHideEventArgs) {
        if (this.cancelHiding) {
            args.cancel = true;
        }
    }
}

@Component({
    template: `
        <button class="buttonOne" #targetOne="tooltipTarget" [igxTooltipTarget]="tooltipRef" style="margin: 100px">
            Target One
        </button>

        <button class="buttonTwo" #targetTwo="tooltipTarget" [igxTooltipTarget]="tooltipRef" style="margin: 100px">
            Target Two
        </button>

        <div igxTooltip #tooltipRef="tooltip">
            Hello, I am a tooltip!
        </div>
        `
})
export class IgxTooltipMultipleTargetsComponent {
    @ViewChild('targetOne', { read: IgxTooltipTargetDirective, static: true }) public targetOne: IgxTooltipDirective;
    @ViewChild('targetTwo', { read: IgxTooltipTargetDirective, static: true }) public targetTwo: IgxTooltipTargetDirective;
    @ViewChild(IgxTooltipDirective, { static: true }) public tooltip: IgxTooltipDirective;
}
