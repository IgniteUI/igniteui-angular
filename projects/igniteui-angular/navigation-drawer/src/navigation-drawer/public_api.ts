import { IgxNavigationDrawerComponent } from './navigation-drawer.component';
import { IgxNavDrawerItemDirective, IgxNavDrawerMiniTemplateDirective, IgxNavDrawerTemplateDirective } from './navigation-drawer.directives';

export * from './navigation-drawer.component';
export * from './navigation-drawer.directives';

/* NOTE: Navigation drawer directives collection for ease-of-use import in standalone components scenario */
export const IGX_NAVIGATION_DRAWER_DIRECTIVES = [
    IgxNavigationDrawerComponent,
    IgxNavDrawerItemDirective,
    IgxNavDrawerMiniTemplateDirective,
    IgxNavDrawerTemplateDirective
] as const;
