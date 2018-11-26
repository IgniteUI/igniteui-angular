import { Component, forwardRef, ChangeDetectionStrategy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { IgxGridComponent } from './grid.component';
import { IgxRowComponent } from '../row.component';
import { GridBaseAPIService } from '../api.service';
import { IgxSelectionAPIService } from '../../core/selection';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-row',
    templateUrl: './grid-row.component.html',
    providers: [{provide: IgxRowComponent, useExisting: forwardRef(() => IgxGridRowComponent)}]
})
export class IgxGridRowComponent extends IgxRowComponent<IgxGridComponent> {
    constructor(
        public gridAPI: GridBaseAPIService<IgxGridComponent>,
        selection: IgxSelectionAPIService,
        public element: ElementRef,
        public cdr: ChangeDetectorRef) {
            // D.P. constructor duplication due to es6 compilation, might be obsolete in the future
            super(gridAPI, selection, element, cdr);
        }
}
