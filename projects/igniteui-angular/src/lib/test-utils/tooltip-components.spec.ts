import { Component, ViewChild } from '@angular/core';
import {
    IgxTooltipTargetDirective, IgxTooltipDirective,
    ITooltipShowEventArgs, ITooltipHideEventArgs
} from '../directives/tooltip/tooltip.directive';

@Component({
    template: `
        <div class="dummyDiv">dummy div for touch tests</div>
        <button [igxTooltipTarget]="tooltipRef"
                (onTooltipShow)="showing($event)" (onTooltipHide)="hiding($event)"
                style="margin: 200px">
            Hover me
        </button>
        <div igxTooltip #tooltipRef="tooltip">
            Hello, I am a tooltip!
        </div>
        `
})
export class IgxTooltipSingleTargetComponent {
    @ViewChild(IgxTooltipDirective) public tooltip: IgxTooltipDirective;
    @ViewChild(IgxTooltipTargetDirective) public tooltipTarget: IgxTooltipTargetDirective;
    public cancelShowing = false;
    public cancelHiding = false;

    showing(args: ITooltipShowEventArgs) {
        if (this.cancelShowing) {
            args.cancel = true;
        }
    }

    hiding(args: ITooltipHideEventArgs) {
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
    @ViewChild('targetOne', { read: IgxTooltipTargetDirective }) public targetOne: IgxTooltipDirective;
    @ViewChild('targetTwo', { read: IgxTooltipTargetDirective }) public targetTwo: IgxTooltipTargetDirective;
    @ViewChild(IgxTooltipDirective) public tooltip: IgxTooltipDirective;
}
