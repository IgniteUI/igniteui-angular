import { IgxProgressBarGradientDirective, IgxProgressBarTextTemplateDirective } from './progressbar.common';
import { IgxCircularProgressBarComponent, IgxLinearProgressBarComponent } from './progressbar.component';

export * from './progressbar.common';
export {
    IgxTextAlign,
    IgxProgressType,
    IChangeProgressEventArgs,
    IgxLinearProgressBarComponent,
    IgxCircularProgressBarComponent
} from './progressbar.component';

/* NOTE: Progress bar (linear and circular) directives collection for ease-of-use import in standalone components scenario */
export const IGX_PROGRESS_BAR_DIRECTIVES = [
    IgxLinearProgressBarComponent,
    IgxCircularProgressBarComponent,
    IgxProgressBarTextTemplateDirective,
    IgxProgressBarGradientDirective
] as const;

/* NOTE: Linear progress bar directives collection for ease-of-use import in standalone components scenario */
export const IGX_LINEAR_PROGRESS_BAR_DIRECTIVES = [
    IgxLinearProgressBarComponent,
    IgxProgressBarGradientDirective
] as const;

/* NOTE: Circular progress bar directives collection for ease-of-use import in standalone components scenario */
export const IGX_CIRCULAR_PROGRESS_BAR_DIRECTIVES = [
    IgxCircularProgressBarComponent,
    IgxProgressBarTextTemplateDirective,
    IgxProgressBarGradientDirective
] as const;
