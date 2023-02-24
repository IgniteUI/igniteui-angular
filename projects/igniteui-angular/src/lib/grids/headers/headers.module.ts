import { NgModule } from '@angular/core';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IgxGridHeaderGroupComponent } from './grid-header-group.component';
import { IgxGridSharedModules } from '../common/shared.module';

import { IgxGridFilteringModule } from '../filtering/base/filtering.module';
import { IgxGridResizingModule } from '../resizing/resize.module';
import { IgxHeaderGroupStylePipe, IgxHeaderGroupWidthPipe, SortingIndexPipe } from './pipes';
export * from './grid-header-group.component';
export * from './grid-header.component';

import { IgxGridHeaderRowComponent } from './grid-header-row.component';

export * from './pipes';
export { IgxGridHeaderComponent } from './grid-header.component';
export { IgxGridHeaderGroupComponent } from './grid-header-group.component';
export { IgxGridHeaderRowComponent } from './grid-header-row.component';

@NgModule({
    imports: [
    IgxGridSharedModules,
    IgxGridFilteringModule,
    IgxGridResizingModule,
    IgxGridHeaderComponent,
    IgxGridHeaderGroupComponent,
    IgxGridHeaderRowComponent,
    SortingIndexPipe,
    IgxHeaderGroupWidthPipe,
    IgxHeaderGroupStylePipe
],
    exports: [
        IgxGridHeaderComponent,
        IgxGridHeaderGroupComponent,
        IgxGridHeaderRowComponent,
        IgxHeaderGroupWidthPipe,
        SortingIndexPipe,
        IgxHeaderGroupStylePipe
    ]
})
export class IgxGridHeadersModule {}
