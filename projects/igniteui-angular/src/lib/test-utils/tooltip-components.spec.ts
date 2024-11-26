import { Component, ViewChild } from '@angular/core';
import { IgxTooltipDirective } from '../directives/tooltip/tooltip.directive';
import { ITooltipHideEventArgs, ITooltipShowEventArgs, IgxTooltipTargetDirective } from '../directives/tooltip/tooltip-target.directive';
import { IgxToggleActionDirective, IgxToggleDirective } from '../directives/toggle/toggle.directive';

@Component({
    template: `
    <div class="dummyDiv">dummy div for touch tests</div>
    <button [igxTooltipTarget]="tooltipRef" [tooltip]="'Infragistics Inc. HQ'"
            (tooltipShow)="showing($event)" (tooltipHide)="hiding($event)"
            style="margin: 200px">
        Hover me
    </button>
    <div igxTooltip #tooltipRef="tooltip">
        Hello, I am a tooltip!
    </div>
    `,
    imports: [IgxTooltipDirective, IgxTooltipTargetDirective]
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
    `,
    imports: [IgxTooltipDirective, IgxTooltipTargetDirective]
})
export class IgxTooltipMultipleTargetsComponent {
    @ViewChild('targetOne', { read: IgxTooltipTargetDirective, static: true }) public targetOne: IgxTooltipDirective;
    @ViewChild('targetTwo', { read: IgxTooltipTargetDirective, static: true }) public targetTwo: IgxTooltipTargetDirective;
    @ViewChild(IgxTooltipDirective, { static: true }) public tooltip: IgxTooltipDirective;
}


@Component({
    template: `
    <button igxTooltipTarget [tooltip]="'Infragistics Inc. HQ'">
            info
    </button>
    `,
    imports: [IgxTooltipTargetDirective]
})
export class IgxTooltipPlainStringComponent {
    @ViewChild(IgxTooltipTargetDirective, { static: true }) public tooltipTarget: IgxTooltipTargetDirective;
}

@Component({
    template: `
    <button [igxTooltipTarget]="tooltipRef" [igxToggleAction]="toggleDiv">
        Options
    </button>
    <div #toggleDiv="toggle" class="toggle-content" igxToggle>Toggle content</div>
    <div #tooltipRef="tooltip" igxTooltip>Test</div>
    `,
    imports: [IgxTooltipDirective, IgxTooltipTargetDirective, IgxToggleActionDirective, IgxToggleDirective]
})
export class IgxTooltipWithToggleActionComponent {
    @ViewChild(IgxTooltipDirective, { static: true }) public tooltip: IgxTooltipDirective;
    @ViewChild(IgxTooltipTargetDirective, { static: true }) public tooltipTarget: IgxTooltipTargetDirective;
    @ViewChild(IgxToggleDirective, { static: true }) public toggleDir: IgxToggleDirective;
}
