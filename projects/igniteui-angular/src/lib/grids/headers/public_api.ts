import { IgxGridHeaderGroupComponent } from './grid-header-group.component';
import { IgxGridHeaderRowComponent } from './grid-header-row.component';
import { IgxGridHeaderComponent } from './grid-header.component';

/* NOTE: Grid headers directives collection for ease-of-use import in standalone components scenario */
export const IGX_GRID_HEADERS_DIRECTIVES = [
    IgxGridHeaderComponent,
    IgxGridHeaderGroupComponent,
    IgxGridHeaderRowComponent
] as const;
