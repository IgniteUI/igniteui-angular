import { IgxPaginatorDirective } from './paginator-interfaces';
import { IgxPageNavigationComponent, IgxPageSizeSelectorComponent, IgxPaginatorComponent, IgxPaginatorContentDirective } from './paginator.component';

/* NOTE: Paginator directives collection for ease-of-use import in standalone components scenario */
export const IGX_PAGINATOR_DIRECTIVES = [
    IgxPaginatorComponent,
    IgxPageNavigationComponent,
    IgxPageSizeSelectorComponent,
    IgxPaginatorContentDirective,
    IgxPaginatorDirective
] as const;
