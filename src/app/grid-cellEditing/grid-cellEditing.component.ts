import { Component, ViewChild } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular';
import { data } from './data';

@Component({
    selector: 'app-grid-cellediting',
    templateUrl: 'grid-cellEditing.component.html'
})
export class GridCellEditingComponent {

    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    public gridWithPK: IgxGridComponent;
    data: any;

    constructor() {
        this.data = data;
    }

    public updateData(): void {
        this.data = [...data];
    }
}
