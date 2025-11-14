import { IgxBannerComponent } from './banner.component';
import { IgxBannerActionsDirective } from './banner.directives';

export * from './banner.component';
export * from './banner.directives';

/* Banner directives collection for ease-of-use import in standalone components scenario */
export const IGX_BANNER_DIRECTIVES = [
    IgxBannerComponent,
    IgxBannerActionsDirective
] as const;
