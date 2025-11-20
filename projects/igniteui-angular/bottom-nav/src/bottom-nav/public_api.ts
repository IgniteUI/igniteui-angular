import { IgxBottomNavContentComponent } from './bottom-nav-content.component';
import { IgxBottomNavHeaderComponent } from './bottom-nav-header.component';
import { IgxBottomNavItemComponent } from './bottom-nav-item.component';
import { IgxBottomNavComponent } from './bottom-nav.component';
import { IgxBottomNavHeaderIconDirective, IgxBottomNavHeaderLabelDirective } from './bottom-nav.directives';

export * from './bottom-nav.component';
export * from './bottom-nav-item.component';
export * from './bottom-nav-header.component';
export * from './bottom-nav.directives';
export * from './bottom-nav-content.component';

/* NOTE: Bottom navigation directives collection for ease-of-use import in standalone components scenario */
export const IGX_BOTTOM_NAV_DIRECTIVES = [
    IgxBottomNavComponent,
    IgxBottomNavItemComponent,
    IgxBottomNavHeaderComponent,
    IgxBottomNavContentComponent,
    IgxBottomNavHeaderLabelDirective,
    IgxBottomNavHeaderIconDirective
] as const;
