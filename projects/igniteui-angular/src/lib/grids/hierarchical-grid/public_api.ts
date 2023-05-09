import { IGX_GRID_COMMON_DIRECTIVES } from '../public_api';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';

export * from './events';
export * from './hierarchical-grid.component';
export * from './row-island.component';

/* NOTE: Hierarchical grid directives collection for ease-of-use import in standalone components scenario */
export const IGX_HIERARCHICAL_GRID_DIRECTIVES = [
    IgxHierarchicalGridComponent,
    IgxRowIslandComponent,
    ...IGX_GRID_COMMON_DIRECTIVES
] as const;
