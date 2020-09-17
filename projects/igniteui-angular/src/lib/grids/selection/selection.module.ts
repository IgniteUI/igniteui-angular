import { NgModule } from '@angular/core';
import { IgxRowSelectorDirective, IgxHeadSelectorDirective, IgxGroupRowSelectorDirective } from './row-selectors';
import { IgxGridDragSelectDirective } from './drag-select.directive';


@NgModule({
    declarations: [
        IgxRowSelectorDirective,
        IgxGroupRowSelectorDirective,
        IgxHeadSelectorDirective,
        IgxGridDragSelectDirective
    ],
    exports: [
        IgxRowSelectorDirective,
        IgxGroupRowSelectorDirective,
        IgxHeadSelectorDirective,
        IgxGridDragSelectDirective
    ]
})
export class IgxGridSelectionModule { }
