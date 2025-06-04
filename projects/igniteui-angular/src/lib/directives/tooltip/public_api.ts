import { IgxTooltipTargetDirective } from './tooltip-target.directive';
import { IgxTooltipDirective } from './tooltip.directive';

export * from './tooltip.directive';
export * from './tooltip-target.directive';
export { TooltipPlacement } from './enums';

/* NOTE: Tooltip directives collection for ease-of-use import in standalone components scenario */
export const IGX_TOOLTIP_DIRECTIVES = [
    IgxTooltipDirective,
    IgxTooltipTargetDirective
] as const;
