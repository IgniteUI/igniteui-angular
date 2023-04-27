import { NgModule } from '@angular/core';
import {
    IgxGroupByRowTemplateDirective,
    IgxGridDetailTemplateDirective
} from './grid.directives';
import { IgxGridComponent } from './grid.component';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IgxGridRowComponent } from './grid-row.component';
import { IgxGridExpandableCellComponent } from './expandable-cell.component';
import { IgxGridGroupByAreaComponent } from '../grouping/grid-group-by-area.component';
import { IGX_GRID_COMMON_DIRECTIVES } from '../public_api';
/**
 * @hidden
 */
@NgModule({
  imports: [
    IgxGridComponent,
    IgxGridRowComponent,
    IgxGridGroupByRowComponent,
    IgxGroupByRowTemplateDirective,
    IgxGridDetailTemplateDirective,
    IgxGridExpandableCellComponent,
    IgxGridGroupByAreaComponent,
    ...IGX_GRID_COMMON_DIRECTIVES
  ],
  exports: [
    IgxGridComponent,
    IgxGridExpandableCellComponent,
    IgxGridGroupByRowComponent,
    IgxGridRowComponent,
    IgxGroupByRowTemplateDirective,
    IgxGridDetailTemplateDirective,
    IgxGridGroupByAreaComponent,
    ...IGX_GRID_COMMON_DIRECTIVES
  ]
})
export class IgxGridModule {}
