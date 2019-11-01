import { Component, forwardRef, ChangeDetectionStrategy, ElementRef, ChangeDetectorRef, HostBinding } from '@angular/core';
import { IgxGridComponent } from './grid.component';
import { IgxRowDirective } from '../row.directive';
import { GridBaseAPIService } from '../api.service';
import { IgxGridSelectionService, IgxGridCRUDService } from '../selection/selection.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-row',
    templateUrl: './grid-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxGridRowComponent) }]
})
export class IgxGridRowComponent extends IgxRowDirective<IgxGridComponent> {

    // R.K. TODO: Remove
    constructor(
        public gridAPI: GridBaseAPIService<IgxGridComponent>,
        public crudService: IgxGridCRUDService,
        public selectionService: IgxGridSelectionService,
        public element: ElementRef,
        public cdr: ChangeDetectorRef) {
            // D.P. constructor duplication due to es6 compilation, might be obsolete in the future
            super(gridAPI, crudService, selectionService, element, cdr);
        }

    @HostBinding('class.igx-grid__tr--mrl')
    get hasColumnLayouts(): boolean {
        return this.grid.hasColumnLayouts;
    }
}
