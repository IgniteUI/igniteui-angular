import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { DisplayDensity, IgxGridComponent } from 'igniteui-angular';
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

    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    private grid1: IgxGridComponent;
    @ViewChild('grid2', { read: IgxGridComponent, static: true })
    private grid2: IgxGridComponent;

    public remote: Observable<any[]>;
    public newData = [];
    public dragdrop = true;
    public density: DisplayDensity = 'comfortable';
    public displayDensities;

    constructor(private remoteService: RemoteService, private cdr: ChangeDetectorRef) {
        this.remoteService.urlBuilder = () => this.remoteService.url;

        this.displayDensities = [
            { label: 'compact', selected: this.density === 'compact', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true }
        ];
    }

    public ngAfterViewInit() {
        this.remote = this.remoteService.remoteData;
        this.remoteService.getData(this.grid1.data);
        this.cdr.detectChanges();
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }

    public handleRowDrag() {

    }

    public handleRowDrop() {

    }

    public onDropAllowed(args) {
        args.cancel = true;
        this.grid2.addRow(args.dragData.rowData);
        this.grid1.deleteRow(args.dragData.rowID);
    }

    public onEnterAllowed(args) {
        this.changeGhostIcon(args.drag.ghostElement, DragIcon.ALLOW);
    }

    public onLeaveAllowed(args) {
        this.changeGhostIcon(args.drag.ghostElement, DragIcon.DEFAULT);
    }

    public onEnterBlocked(args) {
        this.changeGhostIcon(args.drag.ghostElement, DragIcon.BLOCK);
    }

    public onLeaveBlocked(args) {
        this.changeGhostIcon(args.drag.ghostElement, DragIcon.DEFAULT);
    }

    public onDropBlocked(args) {
        args.cancel = true;
    }

    private changeGhostIcon(ghost, icon: string) {
        if (ghost) {
            ghost.querySelector('igx-icon').innerHTML = icon;
        }
    }
}
