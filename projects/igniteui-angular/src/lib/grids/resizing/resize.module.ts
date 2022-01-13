import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxColumnResizingService, IgxPivotColumnResizingService } from './resizing.service';
import { IgxGridColumnResizerComponent, IgxPivotGridColumnResizerComponent } from './resizer.component';
import { IgxPivotResizeHandleDirective, IgxResizeHandleDirective } from './resize-handle.directive';
import { IgxColumnResizerDirective } from './resizer.directive';

export { IgxGridColumnResizerComponent } from './resizer.component';
export { IgxResizeHandleDirective } from './resize-handle.directive';
export { IgxColumnResizerDirective } from './resizer.directive';

@NgModule({
    declarations: [
        IgxGridColumnResizerComponent,
        IgxResizeHandleDirective,
        IgxColumnResizerDirective,
        IgxPivotGridColumnResizerComponent,
        IgxPivotResizeHandleDirective
    ],
    imports: [
        CommonModule
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
