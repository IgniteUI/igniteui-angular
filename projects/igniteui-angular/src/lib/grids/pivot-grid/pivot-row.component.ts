import {
    ChangeDetectionStrategy,
    Component,
    forwardRef
} from '@angular/core';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { IgxRowDirective } from '../row.directive';
import { IgxColumnComponent } from '../hierarchical-grid/public_api';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row',
    templateUrl: './pivot-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxPivotRowComponent) }]
})
export class IgxPivotRowComponent extends IgxRowDirective<IgxPivotGridComponent> {

    /**
     * @hidden
     * @internal
     */
     get viewIndex(): number {
        return this.index;
    }

    public getRowColumns(rowData, cols) {
        cols.forEach(col => {
            col.header = rowData[col.field];
        });
        return cols;
    }

    public getRowColumnWidth(cols: IgxColumnComponent[]) {
        let width = 0;
        cols.forEach(col => {
            width += col.calcWidth;
        });
        return width;
    }

    public get unpinnedDataColumns(){
        const rowKeys = this.grid.pivotConfiguration.rows.map(x => x.member);
        let cols = this.grid.unpinnedColumns;
        cols = cols.filter(x => rowKeys.indexOf(x.field) === -1);
        return cols;
    }

    public get pinnedDataColumns(){
        const rowKeys = this.grid.pivotConfiguration.rows.map(x => x.member);
        let cols = this.grid.pinnedColumns;
        cols = cols.filter(x => rowKeys.indexOf(x.field) === -1);
        return cols;
    }
}

