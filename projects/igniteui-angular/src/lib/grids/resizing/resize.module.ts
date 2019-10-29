import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxColumnResizingService } from './resizing.service';
import { IgxGridColumnResizerComponent } from './resizer.component';
import { IgxResizeHandleDirective } from './resize-handle.directive';
import { IgxColumnResizerDirective } from './resizer.directive';


@NgModule({
    declarations: [
        IgxGridColumnResizerComponent,
        IgxResizeHandleDirective,
        IgxColumnResizerDirective
    ],
    imports: [
        CommonModule
    ],
    exports: [
        IgxGridColumnResizerComponent,
        IgxResizeHandleDirective,
        IgxColumnResizerDirective
    ],
    providers: [
        IgxColumnResizingService
    ]
})
export class IgxGridResizingModule {}
