import { IGX_GRID_COMMON_DIRECTIVES } from '../public_api';
import { IgxPivotDataSelectorComponent } from './pivot-data-selector.component';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { IgxPivotValueChipTemplateDirective } from './pivot-grid.directives';

export * from './pivot-grid.component';
export * from './pivot-grid.interface';
export * from './pivot-grid-aggregate';
export * from './pivot-grid-dimensions';
export * from './pivot-data-selector.component';
export * from './pivot-grid.directives';
export * from '../../data-operations/pivot-strategy';
export * from '../../data-operations/pivot-sort-strategy';

/* NOTE: Pivot grid directives collection for ease-of-use import in standalone components scenario */
export const IGX_PIVOT_GRID_DIRECTIVES = [
    IgxPivotGridComponent,
    IgxPivotDataSelectorComponent,
    IgxPivotValueChipTemplateDirective,
    ...IGX_GRID_COMMON_DIRECTIVES
] as const;
