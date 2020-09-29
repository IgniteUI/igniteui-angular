import { NgModule } from '@angular/core';
import { IgxRowSelectorDirective, IgxHeadSelectorDirective, IgxGroupByRowSelectorDirective } from './row-selectors';
import { IgxGridDragSelectDirective } from './drag-select.directive';


@NgModule({
    declarations: [
        IgxRowSelectorDirective,
        IgxGroupByRowSelectorDirective,
        IgxHeadSelectorDirective,
        IgxGridDragSelectDirective
    ],
    exports: [
        IgxRowSelectorDirective,
        IgxGroupByRowSelectorDirective,
        IgxHeadSelectorDirective,
        IgxGridDragSelectDirective
    ]
})
export class IgxGridSelectionModule { }
