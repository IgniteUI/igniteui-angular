import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { IgxGridModule } from '../../../src/grid/grid.component';
import { IgxComponentsModule, IgxDirectivesModule } from '../../../src/main';
import { GridSampleComponent } from './sample.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        IgxComponentsModule,
        IgxDirectivesModule,
        IgxGridModule,
        ],
    declarations: [
        GridSampleComponent
    ],
})
export class GridSampleModule { }
