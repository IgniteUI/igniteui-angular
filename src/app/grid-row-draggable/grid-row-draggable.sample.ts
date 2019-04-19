import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IgxGridComponent, IgxGridCellComponent } from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';

@Component({
    selector: 'app-grid-row-draggable-sample',
    templateUrl: 'grid-row-draggable.sample.html',
    styleUrls: ['grid-row-draggable.sample.css']
})
export class GridRowDraggableComponent implements AfterViewInit {

    @ViewChild("grid1", { read: IgxGridComponent }) public grid1: IgxGridComponent;
    @ViewChild("grid2", { read: IgxGridComponent }) public grid2: IgxGridComponent;
    remote: Observable<any[]>;
    selection = true;
    dragdrop = true;
    public density = 'comfortable';
    public displayDensities;

    constructor(private remoteService: RemoteService, private cdr: ChangeDetectorRef) {
        this.remoteService.urlBuilder = (state) => this.remoteService.url;

        this.displayDensities = [
            { label: 'compact', selected: this.density === 'compact', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true }
        ];
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    ngAfterViewInit() {
        this.remote = this.remoteService.remoteData;
        this.remoteService.getData(this.grid1.data);
        this.cdr.detectChanges();
    }

    handleRowDrag(args) {
        console.log('RowDrag started!');
    }

    handleRowDrop(args) {
        this.grid2.addRow(args.source.rowData);
        this.grid1.deleteRow(args.source.rowID);
        console.log('Row Drag End!');
    }

    toggle() {
        const currentSelection = this.grid1.selectedRows();
        if (currentSelection !== undefined) {
            const currentSelectionSet = new Set(currentSelection);
            if (currentSelectionSet.has(1) && currentSelectionSet.has(2) && currentSelectionSet.has(5)) {
                this.grid1.deselectRows([1, 2, 5]);
                return;
            }
        }
        this.grid1.selectRows([1, 2, 5], false);
    }

    public dragAreaEnter(args) {
    }

    public dragAreaLeave(args) {
    }
}
