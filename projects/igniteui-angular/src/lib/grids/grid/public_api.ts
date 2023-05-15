import { IGX_GRID_COMMON_DIRECTIVES } from '../public_api';
import { IgxGridComponent } from './grid.component';
import { IgxExcelStyleHeaderIconDirective, IgxGridDetailTemplateDirective, IgxGroupAreaDropDirective, IgxGroupByRowTemplateDirective, IgxHeaderCollapsedIndicatorDirective, IgxHeaderExpandedIndicatorDirective, IgxRowCollapsedIndicatorDirective, IgxRowExpandedIndicatorDirective, IgxSortAscendingHeaderIconDirective, IgxSortDescendingHeaderIconDirective, IgxSortHeaderIconDirective } from './grid.directives';

export * from './grid.component';
export * from './grid.directives';

/* NOTE: Grid directives collection for ease-of-use import in standalone components scenario */
export const IGX_GRID_DIRECTIVES = [
    IgxGridComponent,
    IgxGroupByRowTemplateDirective,
    IgxGridDetailTemplateDirective,
    IgxRowExpandedIndicatorDirective,
    IgxRowCollapsedIndicatorDirective,
    IgxHeaderExpandedIndicatorDirective,
    IgxHeaderCollapsedIndicatorDirective,
    IgxExcelStyleHeaderIconDirective,
    IgxSortHeaderIconDirective,
    IgxSortAscendingHeaderIconDirective,
    IgxSortDescendingHeaderIconDirective,
    IgxGroupAreaDropDirective,
    ...IGX_GRID_COMMON_DIRECTIVES
] as const;
