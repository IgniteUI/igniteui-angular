import { IGX_GRID_COMMON_DIRECTIVES } from '../public_api';
import { IgxTreeGridComponent } from './tree-grid.component';

export * from './tree-grid.component';
export * from './tree-grid.interfaces';
export * from './tree-grid.filtering.strategy';
export * from './tree-grid.grouping.pipe';

/* NOTE: Tree grid directives collection for ease-of-use import in standalone components scenario */
export const IGX_TREE_GRID_DIRECTIVES = [
    IgxTreeGridComponent,
    ...IGX_GRID_COMMON_DIRECTIVES
] as const;
