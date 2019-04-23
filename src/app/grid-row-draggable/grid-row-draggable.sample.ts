import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { IgxGridComponent } from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';

enum DragIcon {
    DEFAULT = 'drag_indicator',
    BLOCK = 'block',
    ALLOW = 'add'
}

@Component({
    selector: 'app-grid-row-draggable-sample',
    templateUrl: 'grid-row-draggable.sample.html',
    styleUrls: ['grid-row-draggable.sample.css']
})
export class GridRowDraggableComponent implements AfterViewInit {

    @ViewChild("grid1", { read: IgxGridComponent }) public grid1: IgxGridComponent;
    @ViewChild("grid2", { read: IgxGridComponent }) public grid2: IgxGridComponent;
    remote: Observable<any[]>;
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

    ngAfterViewInit() {
        this.remote = this.remoteService.remoteData;
        this.remoteService.getData(this.grid1.data);
        this.cdr.detectChanges();
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    public handleRowDrag(args) {

    }

    public handleRowDrop(args) {

    }

    public onDropAllowed(args) {
        this.grid2.addRow(args.drag.data.rowData);
        this.grid1.deleteRow(args.drag.data.rowID);
    }

    public onEnterAllowed(args) {
        this.changeGhostIcon(args.drag._dragGhost, DragIcon.ALLOW);
    }

    public onLeaveAllowed(args) {
        this.changeGhostIcon(args.drag._dragGhost, DragIcon.DEFAULT);
    }

    public onEnterBlocked(args) {
        this.changeGhostIcon(args.drag._dragGhost, DragIcon.BLOCK);
    }

    public onLeaveBlocked(args) {
        this.changeGhostIcon(args.drag._dragGhost, DragIcon.DEFAULT);
    }

    private changeGhostIcon(ghost, icon: string) {
        ghost.querySelector('igx-icon').innerHTML = icon;
    }
}
