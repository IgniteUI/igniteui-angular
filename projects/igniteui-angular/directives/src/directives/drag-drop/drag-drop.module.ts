import { NgModule } from '@angular/core';
import { IgxDragDirective, IgxDragHandleDirective, IgxDragIgnoreDirective, IgxDropDirective } from './drag-drop.directive';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [IgxDragDirective, IgxDropDirective, IgxDragHandleDirective, IgxDragIgnoreDirective],
    exports: [IgxDragDirective, IgxDropDirective, IgxDragHandleDirective, IgxDragIgnoreDirective]
})
export class IgxDragDropModule { }
