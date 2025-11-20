import { IgxThumbFromTemplateDirective, IgxThumbToTemplateDirective, IgxTickLabelTemplateDirective } from './slider.common';
import { IgxSliderComponent } from './slider.component';

export * from './slider.component';
export * from './slider.common';

/* NOTE: Slider directives collection for ease-of-use import in standalone components scenario */
export const IGX_SLIDER_DIRECTIVES = [
    IgxSliderComponent,
    IgxThumbFromTemplateDirective,
    IgxThumbToTemplateDirective,
    IgxTickLabelTemplateDirective
] as const;
