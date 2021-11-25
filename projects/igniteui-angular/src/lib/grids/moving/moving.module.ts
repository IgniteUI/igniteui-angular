import { NgModule } from '@angular/core';
import { IgxColumnMovingDragDirective } from './moving.drag.directive';
import { IgxColumnMovingDropDirective } from './moving.drop.directive';

export { IgxColumnMovingDragDirective } from './moving.drag.directive';
export { IgxColumnMovingDropDirective } from './moving.drop.directive';

@NgModule({
    declarations: [
        IgxColumnMovingDropDirective,
        IgxColumnMovingDragDirective
    ],
    exports: [
        IgxColumnMovingDropDirective,
        IgxColumnMovingDragDirective
    ]
})
export class IgxColumnMovingModule {}
