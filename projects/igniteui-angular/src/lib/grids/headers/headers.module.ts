import { NgModule } from '@angular/core';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IgxGridHeaderGroupComponent } from './grid-header-group.component';
import { IgxGridSharedModules } from '../common/shared.module';
import { IgxColumnMovingModule } from '../moving/moving.module';
import { IgxGridFilteringModule } from '../filtering/base/filtering.module';
import { IgxGridResizingModule } from '../resizing/resize.module';
import { SortingIndexPipe, HasSortingIndexPipe } from './sorting-index.pipe';

@NgModule({
    declarations: [
        IgxGridHeaderComponent,
        IgxGridHeaderGroupComponent,
        SortingIndexPipe,
        HasSortingIndexPipe
    ],
    imports: [
        IgxGridSharedModules,
        IgxGridFilteringModule,
        IgxColumnMovingModule,
        IgxGridResizingModule
    ],
    exports: [
        IgxGridHeaderComponent,
        IgxGridHeaderGroupComponent
    ]
})
export class IgxGridHeadersModule {}
