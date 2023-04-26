import { NgModule } from '@angular/core';
import { IgxTooltipTargetDirective } from './tooltip-target.directive';
import { IgxTooltipComponent } from './tooltip.component';
import { IgxTooltipDirective } from './tooltip.directive';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
 @NgModule({
    exports: [IgxTooltipDirective, IgxTooltipTargetDirective, IgxTooltipComponent],
    imports: [IgxTooltipDirective, IgxTooltipTargetDirective, IgxTooltipComponent]
})
export class IgxTooltipModule { }
