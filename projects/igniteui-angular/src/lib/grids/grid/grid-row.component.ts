import { Component, forwardRef, ChangeDetectionStrategy, ElementRef, ChangeDetectorRef, HostBinding } from '@angular/core';
import { IgxGridComponent } from './grid.component';
import { IgxRowComponent } from '../row.component';
import { GridBaseAPIService } from '../api.service';
import { IgxGridSelectionService, IgxGridCRUDService } from '../../core/grid-selection';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-row',
    templateUrl: './grid-row.component.html',
    providers: [{ provide: IgxRowComponent, useExisting: forwardRef(() => IgxGridRowComponent) }]
})
export class IgxGridRowComponent extends IgxRowComponent<IgxGridComponent> {

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
