import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxChipsModule } from '../../chips/chips.module';
import { IgxGridCommonModule } from '../grid-common.module';
import { IgxGridModule } from '../grid/grid.module';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxGridHierarchicalPipe } from './hierarchical-grid.pipes';
import { IgxChildLayoutComponent } from './igx-layout.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';

@NgModule({
  declarations: [
    IgxHierarchicalGridComponent,
    IgxHierarchicalRowComponent,
    IgxChildLayoutComponent,
    IgxChildGridRowComponent,
    IgxGridHierarchicalPipe
  ],
  exports: [
    IgxGridModule,
    IgxHierarchicalGridComponent,
    IgxHierarchicalRowComponent,
    IgxChildLayoutComponent,
    IgxChildGridRowComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IgxChipsModule,
    IgxGridModule.forRoot()
  ]
})
export class IgxHierarchicalGridModule {
}
