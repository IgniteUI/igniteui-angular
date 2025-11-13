import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxColumnResizingService } from './resizing.service';
import { IgxGridColumnResizerComponent } from './resizer.component';
import { IgxResizeHandleDirective } from './resize-handle.directive';
import { IgxColumnResizerDirective } from './resizer.directive';
import { IgxPivotColumnResizingService } from './pivot-grid/pivot-resizing.service';
import { IgxPivotResizeHandleDirective } from './pivot-grid/pivot-resize-handle.directive';
import { IgxPivotGridColumnResizerComponent } from './pivot-grid/pivot-resizer.component';

export { IgxGridColumnResizerComponent } from './resizer.component';
export { IgxPivotGridColumnResizerComponent } from './pivot-grid/pivot-resizer.component';
export { IgxResizeHandleDirective } from './resize-handle.directive';
export { IgxPivotResizeHandleDirective } from './pivot-grid/pivot-resize-handle.directive';
export { IgxColumnResizerDirective } from './resizer.directive';

@NgModule({
    imports: [
        CommonModule,
        IgxGridColumnResizerComponent,
        IgxResizeHandleDirective,
        IgxColumnResizerDirective,
        IgxPivotGridColumnResizerComponent,
        IgxPivotResizeHandleDirective
    ],
    exports: [
        IgxGridColumnResizerComponent,
        IgxResizeHandleDirective,
        IgxColumnResizerDirective,
        IgxPivotGridColumnResizerComponent,
        IgxPivotResizeHandleDirective
    ],
    providers: [
        IgxColumnResizingService,
        IgxPivotColumnResizingService
    ]
})
export class IgxGridResizingModule {}
