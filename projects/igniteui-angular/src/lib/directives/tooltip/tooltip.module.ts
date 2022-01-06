import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { IgxTooltipTargetDirective } from './tooltip-target.directive';
import { IgxTooltipComponent } from './tooltip.component';
import { IgxTooltipDirective } from './tooltip.directive';

/**
 * @hidden
 */
 @NgModule({
    declarations: [IgxTooltipDirective, IgxTooltipTargetDirective, IgxTooltipComponent],
    exports: [IgxTooltipDirective, IgxTooltipTargetDirective],
    imports: [CommonModule],
    providers: [IgxOverlayService]
})
export class IgxTooltipModule { }