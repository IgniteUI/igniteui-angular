import { NgModule } from '@angular/core';
import { IgxRowSelectorDirective, IgxHeadSelectorDirective } from './row-selectors';
import { IgxGridDragSelectDirective } from './drag-select.directive';


@NgModule({
    declarations: [
        IgxRowSelectorDirective,
        IgxHeadSelectorDirective,
        IgxGridDragSelectDirective
    ],
    exports: [
        IgxRowSelectorDirective,
        IgxHeadSelectorDirective,
        IgxGridDragSelectDirective
    ]
})
export class IgxGridSelectionModule {}
