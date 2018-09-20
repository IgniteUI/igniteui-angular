import { Component, forwardRef } from '@angular/core';
import { IgxGridComponent } from './grid.component';
import { IgxRowComponent } from '../grid-common/row.component';

@Component({
    selector: 'igx-grid-row',
    templateUrl: '../grid-common/row.component.html',
    providers: [{provide: IgxRowComponent, useExisting: forwardRef(() => IgxGridRowComponent)}]
})
export class IgxGridRowComponent extends IgxRowComponent<IgxGridComponent> {
    public get indentation() {
        return this.grid.groupingExpressions.length;
    }
}
